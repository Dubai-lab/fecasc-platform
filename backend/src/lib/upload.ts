import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Team uploads directory
const teamUploadDir = path.join(__dirname, "../../public/uploads/team");

// Ensure directories exist
if (!fs.existsSync(teamUploadDir)) {
  fs.mkdirSync(teamUploadDir, { recursive: true });
}

// File filter for image files
const fileFilter = (_req: any, file: any, cb: any) => {
  // Only allow image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Team upload storage
const teamStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, teamUploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Gallery upload storage with dynamic category-based directory
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category;
    const uploadDir = path.join(__dirname, `../../public/uploads/gallery/${category}`);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
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
