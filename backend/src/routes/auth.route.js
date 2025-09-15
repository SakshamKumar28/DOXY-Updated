import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//User Registration
router.post('/user/register', async (req, res)=>{
    const {fullName, phoneNumber, age, address} = req.body;
    try {
        if(!fullName || !phoneNumber || !age){
            return res.status(400).json({message: 'Please fill all required fields'});
        }
        const existingUser = await User.findOne({phoneNumber});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        const newUser = new User({
            fullName,
            phoneNumber,
            age,
            address
        });

        const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {expiresIn: '7d'});

        await newUser.save();
        //save the token in httpOnly cookie using cookie-parser
        res.cookie('token', token, {
            httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
              maxAge: 7*24*60*60*1000});

        res.status(201).json({message: 'User registered successfully', token});
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
})

//User Login
router.post('/user/login', async (req, res)=>{
    const {phoneNumber} = req.body;
    try {
        if(!phoneNumber){
            return res.status(400).json({message: 'Please provide phone number'});
        }
        const user = await User.find({phoneNumber});
        if(!user){
            return res.status(400).json({message: 'User not found'});
        }
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '7d'});

        //save the token in httpOnly cookie using cookie-parser
        res.cookie('token', token, {
            httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
              maxAge: 7*24*60*60*1000});
        res.status(200).json({message: 'User logged in successfully', token});
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});
    }
})

//User Logout
router.post('/user/logout', (req, res)=>{
    res.clearCookie('token');
    res.status(200).json({message: 'User logged out successfully'});
})


export default router;