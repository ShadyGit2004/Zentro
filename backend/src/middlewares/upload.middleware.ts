import { NextFunction, Request, Response } from "express";
import multer from "multer";
import AppError from "../utils/appError";

const storage = multer.memoryStorage();

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new AppError(422, "INVALID_IMAGE_TYPE", "Only JPG, JPEG, PNG and WebP images are allowed"));
  }

  callback(null, true);
};

// Existing profile-image upload middleware. Keep this export unchanged for other routes.
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
});

const mediaFileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const allowedTypes = [
    "image/jpg", "image/jpeg", "image/png", "image/webp",
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new AppError(422, "INVALID_MEDIA_TYPE", "Only JPG, JPEG, PNG, WebP images and MP3, WAV, OGG, M4A, WebM audio files are allowed"));
  }

  callback(null, true);
};

const uploadPostMediaFields = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { files: 2, fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
]);

export const uploadPostMedia = (req: Request, res: Response, next: NextFunction) => {
  uploadPostMediaFields(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(413, "FILE_TOO_LARGE", "Image must be smaller than 5 MB and audio must be smaller than 10 MB"));
      }
      if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError(422, "INVALID_MEDIA_FIELD", "Use either image or audio for post media"));
      }
      return next(error);
    }

    const files = (req.files ?? {}) as {
      image?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    };

    const image = files.image?.[0];
    const audio = files.audio?.[0];

    if (image && audio) {
      return next(new AppError(422, "MULTIPLE_MEDIA_TYPES", "A post can contain either an image or an audio file, not both"));
    }

    if (image && image.size > 5 * 1024 * 1024) {
      return next(new AppError(413, "IMAGE_TOO_LARGE", "Image must be smaller than 5 MB"));
    }

    req.file = image ?? audio;
    next();
  });
};

export default uploadImage;
