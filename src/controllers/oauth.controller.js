import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  cookieOptions,
  generateAccessAndRefreshTokens,
} from "./user.controller.js";

const STATE_COOKIE = "oauth_state";

const backendUrl = () =>
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
const frontendUrl = () => process.env.CORS_ORIGIN || "http://localhost:5173";
const redirectUri = (provider) =>
  `${backendUrl()}/api/v1/auth/${provider}/callback`;

const providers = {
  google: {
    idField: "googleId",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    async fetchProfile(accessToken) {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new ApiError(502, "Failed to fetch Google profile");
      const p = await res.json();
      return {
        providerId: p.sub,
        email: p.email_verified ? p.email : null,
        name: p.name,
        avatar: p.picture,
        handle: p.email?.split("@")[0],
      };
    },
  },
  github: {
    idField: "githubId",
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    async fetchProfile(accessToken) {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "watchhour",
      };
      const res = await fetch("https://api.github.com/user", { headers });
      if (!res.ok) throw new ApiError(502, "Failed to fetch GitHub profile");
      const p = await res.json();

      // the profile email is often private; use the verified primary email
      let email = null;
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers,
      });
      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        email = emails.find((e) => e.primary && e.verified)?.email || null;
      }

      return {
        providerId: String(p.id),
        email,
        name: p.name || p.login,
        avatar: p.avatar_url,
        handle: p.login,
      };
    },
  },
};

const failRedirect = (res, message) =>
  res.redirect(
    `${frontendUrl()}/login?error=${encodeURIComponent(message)}`
  );

const uniqueUsername = async (base) => {
  const clean =
    (base || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "user";
  let candidate = clean;
  while (await User.exists({ username: candidate })) {
    candidate = `${clean}${crypto.randomInt(1000, 99999)}`;
  }
  return candidate;
};

const findOrCreateUser = async (provider, profile) => {
  const { idField } = providers[provider];

  let user = await User.findOne({ [idField]: profile.providerId });
  if (user) return user;

  // link to an existing account that has the same verified email
  if (profile.email) {
    user = await User.findOne({ email: profile.email.toLowerCase() });
    if (user) {
      user[idField] = profile.providerId;
      await user.save({ validateBeforeSave: false });
      return user;
    }
  }

  if (!profile.email) {
    throw new ApiError(
      400,
      `Your ${provider} account has no verified email address`
    );
  }

  return User.create({
    fullname: profile.name || profile.handle || "New user",
    email: profile.email.toLowerCase(),
    username: await uniqueUsername(profile.handle || profile.email.split("@")[0]),
    avatar:
      profile.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "U")}`,
    coverImage: "",
    [idField]: profile.providerId,
  });
};

const startOAuth = (provider) =>
  asyncHandler(async (req, res) => {
    const config = providers[provider];
    if (!config.clientId() || !config.clientSecret()) {
      return failRedirect(
        res,
        `${provider} sign-in is not configured on the server`
      );
    }

    const state = crypto.randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      ...cookieOptions(),
      maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
      client_id: config.clientId(),
      redirect_uri: redirectUri(provider),
      response_type: "code",
      scope: config.scope,
      state,
    });
    res.redirect(`${config.authUrl}?${params}`);
  });

const oauthCallback = (provider) =>
  asyncHandler(async (req, res) => {
    const config = providers[provider];
    const { code, state, error } = req.query;

    if (error) return failRedirect(res, `${provider} sign-in was cancelled`);

    const expectedState = req.cookies?.[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, cookieOptions());
    if (!code || !state || !expectedState || state !== expectedState) {
      return failRedirect(res, "Invalid sign-in request. Please try again.");
    }

    try {
      const tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.clientId(),
          client_secret: config.clientSecret(),
          code,
          redirect_uri: redirectUri(provider),
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new ApiError(502, `Could not sign in with ${provider}`);
      }

      const profile = await config.fetchProfile(tokenData.access_token);
      const user = await findOrCreateUser(provider, profile);
      const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      const options = cookieOptions();
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(`${frontendUrl()}/oauth/callback`);
    } catch (err) {
      console.error(`${provider} OAuth failed:`, err?.message || err);
      failRedirect(res, err?.message || `Could not sign in with ${provider}`);
    }
  });

export const googleStart = startOAuth("google");
export const googleCallback = oauthCallback("google");
export const githubStart = startOAuth("github");
export const githubCallback = oauthCallback("github");
