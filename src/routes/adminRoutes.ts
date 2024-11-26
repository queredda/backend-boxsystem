import express from 'express';
import { protectAdmin } from '../middlewares/protect';
import { AdminController } from '../controllers/adminController';
import { uploadSingleImage } from '../middlewares/uploadFileToBuffer';

const router = express.Router();

// post create inventory
router.post(
  '/inventory',
  protectAdmin,
  uploadSingleImage,
  AdminController.createInventory,
);

// get all inventory
router.get('/inventory', protectAdmin, AdminController.getAllInventory);

export default router;
