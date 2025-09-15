import express from 'express';
import { 
    registerUser, 
    verifyUser,       // ADDED
    loginUser, 
    verifyLogin,      // ADDED
    logoutUser 
} from '../controllers/auth.controller.js';


const router = express.Router();

// --- Registration Flow ---
// Step 1: User provides details, OTP is sent
router.post('/user/register', registerUser);
// Step 2: User provides OTP to verify and complete registration
router.post('/user/verify', verifyUser); // ADDED

// --- Login Flow ---
// Step 1: User provides phone number, OTP is sent
router.post('/user/login', loginUser);
// Step 2: User provides OTP to verify and get a token
router.post('/user/verify-login', verifyLogin); // ADDED

// --- Logout ---
router.post('/user/logout', logoutUser);


export default router;