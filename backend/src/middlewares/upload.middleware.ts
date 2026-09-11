import multer from "multer";
import AppError from "../utils/appError";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new AppError(
        422,
        "INVALID_IMAGE_TYPE",
        "Only JPEG, PNG and WebP images are allowed"
      )
    );
  }

  callback(null, true);
};

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 mb
  },
});

export default uploadProfileImage;