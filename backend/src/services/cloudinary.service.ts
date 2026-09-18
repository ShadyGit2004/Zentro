import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

import { randomUUID } from "crypto";

/**
 * Upload profile image.
 *
 * User can upload up to 5 MB.
 * Cloudinary creates an optimized stored version:
 * - max 400x400
 * - automatic quality
 * - automatic format
 */
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

        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
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

/**
 * Upload post image.
 *
 * User can upload up to 5 MB.
 * Cloudinary stores a resized/optimized version:
 * - max width 1200px
 * - aspect ratio preserved
 * - automatic quality
 * - automatic format
 */
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

        transformation: [
          {
            width: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
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

/**
 * This is an additional delivery optimization layer.
 * Generate an optimized profile image URL. *
 * Profile images are displayed relatively small, 
 * so 400px is sufficient for profile/avatar usage. * 
 * f_auto -> best supported format (WebP/AVIF/etc.) * 
 * q_auto -> automatic quality optimization *
 * c_fill -> exact square dimensions *
 * g_auto -> Cloudinary chooses the important area 
**/
export const getOptimizedProfileImageUrl = (
  publicId: string,
  version?: number
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    type: "upload",
    resource_type: "image",
    version,

    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });
};

/** 
 * Generate an optimized post image URL. *
 * The image is limited to 1200px wide while preserving *
 * its original aspect ratio. * 
 * No forced height/crop is used for post images.
**/
export const getOptimizedPostImageUrl = (
  publicId: string,
  version?: number
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    type: "upload",
    resource_type: "image",
    version,

    transformation: [
      {
        width: 1200,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });
};

export const deleteCloudinaryImage = (publicId: string): Promise<void> => {
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