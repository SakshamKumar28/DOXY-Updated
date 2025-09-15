import express from 'express';
import dotenv from 'dotenv';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
dotenv.config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//User Registration
router.post('/user/register', registerUser);

//User Login
router.post('/user/login', loginUser);

//User Logout
router.post('/user/logout', logoutUser);


export default router;