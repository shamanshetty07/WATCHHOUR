import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../public/uploads");

const isPlaceholder = (value) => !value || value.startsWith("your_");

// Cloudinary credentials are read lazily so dotenv is guaranteed to have loaded.
const isCloudinaryConfigured = () =>
  !isPlaceholder(process.env.CLOUDINARY_CLOUD_NAME) &&
  !isPlaceholder(process.env.CLOUDINARY_API_KEY) &&
  !isPlaceholder(process.env.CLOUDINARY_API_SECRET);

const removeLocalFile = (localFilePath) => {
  try {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  } catch {
    // best-effort cleanup
  }
};

// Dev fallback: keep the file on disk and serve it from /uploads.
const saveLocally = (localFilePath) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const fileName = path.basename(localFilePath);
  fs.renameSync(localFilePath, path.join(uploadsDir, fileName));
  const baseUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
  return { url: `${baseUrl}/uploads/${fileName}`, duration: 0 };
};

/**
 * Uploads a local file and returns { url, duration }.
 * Uses Cloudinary when configured, otherwise stores the file locally.
 * Returns null when there is no file; throws when the upload itself fails.
 */
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  if (!isCloudinaryConfigured()) {
    return saveLocally(localFilePath);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    return await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error?.message || error);
    const err = new Error(
      `Cloudinary upload failed: ${error?.message || "unknown error"}`
    );
    err.statusCode = 502;
    throw err;
  } finally {
    removeLocalFile(localFilePath);
  }
};

export { uploadOnCloudinary, removeLocalFile };
