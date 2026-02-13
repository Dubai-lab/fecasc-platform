import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter for image files
const fileFilter = (_req: any, file: any, cb: any) => {
  // Only allow image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split(".").pop());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Team upload storage on Cloudinary
const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fecasc/team",
    resource_type: "auto",
  } as any,
});

// Gallery upload storage on Cloudinary
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fecasc/gallery",
    resource_type: "auto",
  } as any,
});

export const upload = multer({
  storage: teamStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export const galleryUpload = multer({
  storage: galleryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
