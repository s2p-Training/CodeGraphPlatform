const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const asyncHandler = require('../../middleware/asyncHandler');

// Configure Cloudinary only if credentials exist
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'proquizmaster/problems',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    },
  });
} else {
  // Fallback to local storage if Cloudinary not configured
  const uploadDir = 'uploads/problems';
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// POST /api/admin/upload
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // If using local storage, construct the URL
  // In production, this would be your domain or a CDN
  let url = req.file.path;
  if (!useCloudinary) {
      url = `http://localhost:${process.env.PORT || 5001}/${req.file.path.replace(/\\/g, '/')}`;
  }

  res.json({
    success: true,
    data: url,
    message: useCloudinary ? 'Image uploaded to Cloudinary' : 'Image uploaded locally'
  });
}));

module.exports = router;
