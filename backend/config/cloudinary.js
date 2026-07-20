import dotenv from 'dotenv';
dotenv.config();
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
cloudinary.v2.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
  storage = new CloudinaryStorage({ cloudinary: cloudinary.v2, params: { folder: 'watchstore', allowed_formats: ['jpg','jpeg','png','webp','mp4','webm'], resource_type: 'auto' } });
} else { storage = multer.memoryStorage(); }
export const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
export { cloudinary };
