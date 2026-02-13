import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

console.log(`Cloudinary configured: ${isCloudinaryConfigured}`);

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

// Fallback local storage for team uploads
const teamUploadDir = path.join(__dirname, "../../public/uploads/team");
if (!fs.existsSync(teamUploadDir)) {
  fs.mkdirSync(teamUploadDir, { recursive: true });
}

const localTeamStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, teamUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Fallback local storage for gallery uploads
const galleryUploadDir = path.join(__dirname, "../../public/uploads/gallery");
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}

const localGalleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, galleryUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Use Cloudinary if configured, otherwise use local storage
let teamStorage: any;
let galleryStorage: any;

if (isCloudinaryConfigured) {
  teamStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "fecasc/team",
      resource_type: "auto",
    } as any,
  });

  galleryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "fecasc/gallery",
      resource_type: "auto",
    } as any,
  });
} else {
  teamStorage = localTeamStorage;
  galleryStorage = localGalleryStorage;
}

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
