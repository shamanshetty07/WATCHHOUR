import { ApiError } from "../utils/ApiError.js";

export const handleMulterError = (err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return next(new ApiError(400, "File is too large. Max size is 100MB."));
  }
  if (err?.name === "MulterError") {
    return next(new ApiError(400, err.message));
  }
  next(err);
};
