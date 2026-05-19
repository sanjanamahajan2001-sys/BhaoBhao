import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOAD_DIR = path.join(__dirname, '../public/uploads');

const allowedMimeTypes = {
  images: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  docs: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  imageDoc: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const createUploader = (subPath = 'undefined', type = 'imageDoc', maxSizeMB = 5, fieldName = 'file') => {
  const fullPath = path.join(BASE_UPLOAD_DIR, subPath);
  fs.mkdirSync(fullPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      req.uploadPath = subPath;
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const timestamp = Date.now();
      const uniqueName = `${baseName}_${timestamp}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = allowedMimeTypes[type] || allowedMimeTypes.imageDoc;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${type} file types are allowed.`), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          status: false,
          message: err.code === 'LIMIT_FILE_SIZE'
            ? `File too large. Max allowed size is ${maxSizeMB} MB.`
            : err.message,
        });
      }

      if (err) {
        return res.status(400).json({
          status: false,
          message: err.message || 'File upload error.',
        });
      }

      next();
    });
  };
};



// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // Fix __dirname in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const BASE_UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// const allowedMimeTypes = {
//   images: [
//     'image/jpeg',
//     'image/png',
//     'image/webp',
//   ],
//   docs: [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   ],
//   imageDoc: [
//     'image/jpeg',
//     'image/png',
//     'image/webp',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   ],
// };

// export const createUploader = (subPath = 'undefined', type = 'imageDoc', maxSizeMB = 5) => {
//   const fullPath = path.join(BASE_UPLOAD_DIR, subPath);

//   // Ensure directory exists
//   fs.mkdirSync(fullPath, { recursive: true });

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       req.uploadPath = subPath;
//       cb(null, fullPath);
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const baseName = path.basename(file.originalname, ext);
//       const timestamp = Date.now();
//       const uniqueName = `${baseName}_${timestamp}${ext}`;
//       cb(null, uniqueName);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const allowedTypes = allowedMimeTypes[type] || allowedMimeTypes.imageDoc;
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Only ${type} file types are allowed.`), false);
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: {
//       fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
//     },
//   });
// };
