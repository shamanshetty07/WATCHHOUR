import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router
  .route("/add/:videoId/:playlistId")
  .patch(verifyJWT, addVideoToPlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .patch(verifyJWT, removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId").patch(verifyJWT, updatePlaylist);

export default router;
