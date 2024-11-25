import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// POST /ogout
// This route handles user logout (currently commented out)
router.post('/', AuthController.loginWithEmail);

export default router;
