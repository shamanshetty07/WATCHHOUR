import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, "../../public/temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const IMAGE_FIELDS = ["avatar", "coverImage", "thumbnail"];

// Reject non-image uploads for image fields and non-video uploads for videoFile.
const fileFilter = (req, file, cb) => {
  if (IMAGE_FIELDS.includes(file.fieldname) && !file.mimetype.startsWith("image/")) {
    return cb(new ApiError(400, `${file.fieldname} must be an image file`));
  }
  if (file.fieldname === "videoFile" && !file.mimetype.startsWith("video/")) {
    return cb(new ApiError(400, "videoFile must be a video file"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});
