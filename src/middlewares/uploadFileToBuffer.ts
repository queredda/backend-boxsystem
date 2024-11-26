import multer from 'multer';
import { FileFilterCallback } from 'multer';
import { Request } from 'express';
import createHttpError from 'http-errors';

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(createHttpError(400, 'File type not supported'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
    files: 2,
  },
  fileFilter,
});

// Export different middleware configurations
export const uploadSingleImage = upload.single('image'); // untuk upload 1 file
export const uploadMultipleImages = upload.array('images', 2); // untuk upload multiple files (max 2)
export const uploadMultipleFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 1 },
]);
