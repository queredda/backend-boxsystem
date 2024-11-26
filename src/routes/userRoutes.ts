import express from 'express';
import { protectUser } from '../middlewares/protect';
import { UserController } from '../controllers/userController';

const router = express.Router();

router.post('/', protectUser, UserController.createLoanRequest);

router.get('/inventory', protectUser, UserController.getAllInventory);

router.get('/loanrequest', protectUser, UserController.getAllLoanRequests);

export default router;
