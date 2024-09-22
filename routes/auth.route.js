import express from 'express';
import { login, logout, signupController, verifyEmail } from '../controllers/auth.controller.js';
const router = express.Router();

router.post("/signup", signupController)
router.post("/verify-email", verifyEmail)
router.post("/logout", logout )
router.post("/login", login)



export default router;