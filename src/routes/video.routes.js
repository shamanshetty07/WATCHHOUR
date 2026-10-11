import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalVerifyJWT } from "../middlewares/optionalAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { handleMulterError } from "../middlewares/multerError.middleware.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/").post(
  verifyJWT,
  (req, res, next) => {
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  publishAVideo
);

router.route("/v/:videoId").get(optionalVerifyJWT, getVideoById);
router
  .route("/v/:videoId")
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
