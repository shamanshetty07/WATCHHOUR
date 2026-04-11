import { Router } from "express";
import {
  loginuser,
  registerUser,
  logoutUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  getUserChannelProfile,
  getWatdhHistory,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginuser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh_token").post(refreshAcessToken); //if any error shows up first check this
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("/coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatdhHistory);
export default router;
