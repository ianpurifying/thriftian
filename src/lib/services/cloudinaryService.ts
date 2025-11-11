// lib/services/cloudinaryService.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  async uploadImage(
    base64Image: string,
    folder: string = "products"
  ): Promise<{ url: string; publicId: string }> {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    await cloudinary.api.delete_resources(publicIds);
  }
}

export const cloudinaryService = new CloudinaryService();
