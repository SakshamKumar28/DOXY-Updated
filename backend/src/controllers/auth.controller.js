import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const JWT_SECRET = process.env.JWT_SECRET;

// --- ADDED: Helper function to ensure phone number is in E.164 format for Twilio ---
const normalizePhoneNumber = (phoneNumber) => {
    // Removes any non-digit characters except '+' at the start
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
        return cleaned; // Already in E.164 format
    }
    if (cleaned.length === 10) {
        return `+91${cleaned}`; // Add Indian country code for 10-digit numbers
    }
    // For other cases, you might want more complex logic or to return an error
    return phoneNumber; 
};


// --- REFACTORED: Now properly handles errors and throws them ---
async function sendVerificationCode(verificationCode, phoneNumber) {
    try {
        const normalizedNumber = normalizePhoneNumber(phoneNumber);

        const message = await client.messages.create({
            body: `Your verification code is: ${verificationCode}. This is for testing.`,
            // NOTE: Using TWILIO_PHONE_NUMBER for development. Switch to TWILIO_SENDER_ID for production in India.
            from: process.env.TWILIO_PHONE_NUMBER, 
            to: normalizedNumber
        });
        
        console.log("Message sent successfully. SID:", message.sid);
    } catch (error) {
        console.error("Twilio SMS sending failed:", error);
        // FIXED: Throw an actual error to be caught by the calling function
        throw new Error('Failed to send verification code.'); 
    }
}


// User Registration
export const registerUser = async (req, res) => {
    const { fullName, phoneNumber, age, address } = req.body;
    try {
        if (!fullName || !phoneNumber || !age) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid Phone Number!!" });
        }
        const formattedPhoneNumber = normalizePhoneNumber(phoneNumber);

        // Check if a VERIFIED user already exists
        const existingVerifiedUser = await User.findOne({ phoneNumber: formattedPhoneNumber, accountVerified: true });
        if (existingVerifiedUser) {
            return res.status(409).json({ message: 'A verified user with this phone number already exists.' }); // 409 Conflict
        }
        
        // --- IMPROVED LOGIC: Find existing unverified user or create a new one ---
        let user = await User.findOne({ phoneNumber: formattedPhoneNumber, accountVerified: false });

        if (!user) {
            user = new User({ fullName, phoneNumber: formattedPhoneNumber, age, address });
        } else {
            // Update details if an unverified user tries to register again
            user.fullName = fullName;
            user.age = age;
            user.address = address;
        }

        const verificationCode = await user.generateVerificationCode();
        await user.save(); // Save the user with the new code

        // --- FIXED: Await the SMS and handle potential errors ---
        await sendVerificationCode(verificationCode, user.phoneNumber);

        // --- SECURITY FIX: Do NOT send a token before verification ---
        res.status(201).json({ 
            message: 'Verification code sent successfully. Please verify your account.' ,
            userId: user._id // Send userId to the client to use in the verification step
        });

    } catch (error) {
        // This will catch errors from both the database and the sendVerificationCode function
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- ADDED: A new function is required to verify the code ---
export const verifyUser = async (req, res) => {
    const { userId, verificationCode } = req.body;
    try {
        if (!userId || !verificationCode) {
            return res.status(400).json({ message: 'User ID and verification code are required.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.accountVerified) {
            return res.status(400).json({ message: 'Account is already verified.' });
        }
        
        const isCodeValid = user.verificationCode === verificationCode;
        const isCodeExpired = new Date() > new Date(user.verificationCodeExpires);

        if (!isCodeValid || isCodeExpired) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        // --- SUCCESS: Mark user as verified ---
        user.accountVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();
        
        // --- SECURITY FIX: Issue token ONLY after successful verification ---
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Account verified successfully!', token });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// --- UPDATED: User Login now initiates OTP flow ---
export const loginUser = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Please provide a phone number' });
        }
        const formattedPhoneNumber = normalizePhoneNumber(phoneNumber);
        
        const user = await User.findOne({ phoneNumber: formattedPhoneNumber });

        // Ensure the user exists and their account has been previously verified
        if (!user || !user.accountVerified) {
            return res.status(404).json({ message: 'No verified user found with this number. Please register first.' });
        }
        
        // Generate a new verification code for login
        const verificationCode = await user.generateVerificationCode();
        await user.save(); // Save the new code and its expiry to the user document

        // Send the code via Twilio
        await sendVerificationCode(verificationCode, user.phoneNumber);

        // Respond with success, prompting the user to enter the code
        res.status(200).json({
            message: 'Login OTP sent successfully.',
            userId: user._id
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- NEW: Function to verify the login OTP and issue a token ---
export const verifyLogin = async (req, res) => {
    const { userId, verificationCode } = req.body;
    try {
        if (!userId || !verificationCode) {
            return res.status(400).json({ message: 'User ID and verification code are required.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const isCodeValid = user.verificationCode === verificationCode;
        const isCodeExpired = new Date() > new Date(user.verificationCodeExpires);

        if (!isCodeValid || isCodeExpired) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        // Clear the verification code after successful use
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();
        
        // --- SUCCESS: Issue token and log the user in ---
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'User logged in successfully!', token });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User Logout
export const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
};