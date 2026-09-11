import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

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