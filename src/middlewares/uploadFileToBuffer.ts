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
    createHttpError(400, 'File type not supported');
  }
};

const uploadFileToBuffer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
    files: 2,
  },
  fileFilter,
});

module.exports = uploadFileToBuffer;
