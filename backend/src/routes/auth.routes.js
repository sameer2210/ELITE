import express from 'express';
import {
  googleAuth,
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);

export default router;
