import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

import { randomUUID } from "crypto";

export const uploadProfileImage = (
  buffer: Buffer,
  userId: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "zentro/profile-images",
        public_id: userId,
        overwrite: true,
        resource_type: "image",
        // notification_url: "https://mysite.example.com/notify_endpoint",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
    return;
  });
};

export const uploadPostImage = (
  buffer: Buffer,
  postId: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const publicId = `${postId}-${randomUUID()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "zentro/post-images",
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryImage = (
  publicId: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image" },
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }
    );
  });
};