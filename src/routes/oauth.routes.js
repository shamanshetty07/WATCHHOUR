import { Router } from "express";
import {
  googleStart,
  googleCallback,
  githubStart,
  githubCallback,
} from "../controllers/oauth.controller.js";

const router = Router();

router.route("/google").get(googleStart);
router.route("/google/callback").get(googleCallback);
router.route("/github").get(githubStart);
router.route("/github/callback").get(githubCallback);

export default router;
