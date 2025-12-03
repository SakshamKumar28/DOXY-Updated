// backend/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// verifyJWT remains the same for now...
export const verifyJWT = asyncHandler(async (req, res, next) => {
    // ... (existing code with optional previous logging) ...
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
        // console.log("verifyJWT - Received token:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request. No user token.");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
         // console.log("verifyJWT - Decoded token:", decodedToken);

        const user = await User.findById(decodedToken?.userId).select("-verificationCode -verificationExpiry");

        if (!user) {
            throw new ApiError(401, "Invalid user access token. User not found.");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("verifyJWT - Error:", error.name, error.message);
         if (error.name === 'TokenExpiredError') {
             throw new ApiError(401, "User session expired. Please log in again.");
         }
        throw new ApiError(401, error?.message || "Invalid user access token.");
    }
});


// --- Add Logging and Error Handling to verifyDoctorJWT ---
export const verifyDoctorJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.doctor_token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request. Please log in as a doctor.");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Important: Make sure doctorId is correctly extracted if it's nested
        const doctorId = decodedToken?.doctorId || decodedToken?._id; // Adjust if your payload structure differs
        if (!doctorId) {
             throw new ApiError(401, "Invalid token payload.");
        }

        const doctor = await Doctor.findById(doctorId); // Query using the extracted ID

        if (!doctor) {
            throw new ApiError(401, "Invalid access token. Doctor not found.");
        }

        req.doctor = doctor; // Attach doctor object to request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
         if (error.name === 'TokenExpiredError') {
             throw new ApiError(401, "Doctor session expired. Please log in again.");
         }
         if (error.name === 'JsonWebTokenError') {
              throw new ApiError(401, "Invalid token format.");
         }
        // Throw a generic error for other issues
        throw new ApiError(401, error?.message || "Doctor authentication failed.");
    }
});