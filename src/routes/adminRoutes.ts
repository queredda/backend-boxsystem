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

// get all loan requests
router.get('/loanrequest', protectAdmin, AdminController.getAllLoanRequests);

router.patch('/loanrequest', protectAdmin, AdminController.updateLoanRequest);

router.get('/borroweditems', protectAdmin, AdminController.getAllBorrowedItems);

export default router;
