import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Initialization ---
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const JWT_SECRET = process.env.JWT_SECRET;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// --- Helper Functions ---

const normalizePhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+91')) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    throw new ApiError(400, "Invalid phone number format. Please provide a 10-digit Indian number.");
};

const sendVerificationSms = async (verificationCode, phoneNumber) => {
    try {
        await client.messages.create({
            body: `Your DOXY verification code is: ${verificationCode}`,
            from: TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log(`Verification SMS sent to ${phoneNumber}`);
    } catch (error) {
        // Log the detailed error but throw a generic one to the user
        console.error("Twilio SMS sending failed:", error);
        throw new ApiError(500, 'Failed to send verification code.');
    }
};

const issueTokenAndSetCookie = (res, user) => {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    return res
        .status(200)
        .cookie('token', token, options)
        .json(new ApiResponse(200, { user: { _id: user._id, fullName: user.fullName }, token }, "User action successful!"));
};

// --- Controller Functions ---

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, age, address } = req.body;

    if ([fullName, phoneNumber, age].some((field) => !field || String(field).trim() === "")) {
        throw new ApiError(400, 'Full name, phone number, and age are required fields.');
    }

    const formattedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const existingVerifiedUser = await User.findOne({ phoneNumber: formattedPhoneNumber, accountVerified: true });
    if (existingVerifiedUser) {
        throw new ApiError(409, 'A verified user with this phone number already exists.');
    }

    // Find an existing unverified user or create a new one
    let user = await User.findOne({ phoneNumber: formattedPhoneNumber, accountVerified: false });

    if (user) {
        // Update details if an unverified user registers again
        user.fullName = fullName;
        user.age = age;
        user.address = address;
    } else {
        user = await User.create({ fullName, phoneNumber: formattedPhoneNumber, age, address });
    }

    const verificationCode = await user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    await sendVerificationSms(verificationCode, user.phoneNumber);

    res.status(201).json(new ApiResponse(201, { userId: user._id }, 'Verification code sent successfully.'));
});

export const verifyUser = asyncHandler(async (req, res) => {
    const { userId, verificationCode } = req.body;

    if (!userId || !verificationCode) {
        throw new ApiError(400, "User ID and verification code are required.");
    }

    // FIXED: Use the correct field path for nested verification object
    const user = await User.findById(userId).select("+verificationCode +verificationExpiry");

    if (!user) throw new ApiError(404, "User not found.");
    if (user.accountVerified) throw new ApiError(400, "Account is already verified.");

    // Use the secure verification method from the model
    const isCodeValid = await user.verifyCode(verificationCode);

    if (!isCodeValid) {
        throw new ApiError(400, "Invalid or expired verification code.");
    }

    user.accountVerified = true;
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return issueTokenAndSetCookie(res, user);
});

export const loginUser = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new ApiError(400, "Phone number is required.");
    
    const formattedPhoneNumber = normalizePhoneNumber(phoneNumber);
    
    const user = await User.findOne({ phoneNumber: formattedPhoneNumber });

    if (!user || !user.accountVerified) {
        throw new ApiError(404, 'No verified user found with this number. Please register first.');
    }

    const verificationCode = await user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    await sendVerificationSms(verificationCode, user.phoneNumber);

    res.status(200).json(new ApiResponse(200, { userId: user._id }, 'Login OTP sent successfully.'));
});

// backend/src/controllers/auth.controller.js

export const verifyLogin = asyncHandler(async (req, res) => {
    const { userId, verificationCode } = req.body;
    console.log(`Verify Login Attempt - UserID: ${userId}, Code: ${verificationCode}`); // <-- ADD LOG

    if (!userId || !verificationCode) {
        console.error("Verify Login Error: Missing userId or verificationCode"); // <-- ADD LOG
        throw new ApiError(400, "User ID and verification code are required.");
    }

    const user = await User.findById(userId).select("+verificationCode +verificationExpiry");

    if (!user) {
        console.error(`Verify Login Error: User not found for ID: ${userId}`); // <-- ADD LOG
        throw new ApiError(404, "User not found.");
    }

    // Log expiry time for debugging
    console.log(`Verify Login - Code Expiry: ${user.verificationExpiry}, Current Time: ${new Date()}`); // <-- ADD LOG

    const isCodeValid = await user.verifyCode(verificationCode);
    console.log(`Verify Login - Is Code Valid: ${isCodeValid}`); // <-- ADD LOG

    if (!isCodeValid) {
         console.error(`Verify Login Error: Invalid or expired code for UserID: ${userId}`); // <-- ADD LOG
        throw new ApiError(400, "Invalid or expired verification code.");
    }

    // Clear the code after use
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(`Verify Login Success for UserID: ${userId}`); // <-- ADD LOG
    return issueTokenAndSetCookie(res, user);
});

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const getUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User data fetched successfully"));
});