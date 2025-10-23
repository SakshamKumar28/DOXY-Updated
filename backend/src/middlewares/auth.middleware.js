// backend/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/backend/src/models/user.model.js]
import Doctor from '../models/doctor.model.js'; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/backend/src/models/doctor.model.js]
import { ApiError } from '../utils/ApiError.js'; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/backend/src/utils/ApiError.js]
import { asyncHandler } from '../utils/asyncHandler.js'; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-d8274377137c426ade7ad3fb508a00bdbf7e8137/backend/src/utils/asyncHandler.js]

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
    console.log(`--- verifyDoctorJWT Middleware Triggered for path: ${req.path} ---`); // Log entry
    try {
        const token = req.cookies?.doctor_token || req.header("Authorization")?.replace("Bearer ", "");
        console.log("verifyDoctorJWT - Received token:", token); // Log the token found
        console.log("verifyDoctorJWT - All Cookies:", req.cookies); // Log all cookies received

        if (!token) {
            console.error("verifyDoctorJWT - Error: No token found.");
            throw new ApiError(401, "Unauthorized request. Please log in as a doctor.");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verifyDoctorJWT - Decoded token:", decodedToken); // Log the decoded payload

        // Important: Make sure doctorId is correctly extracted if it's nested
        const doctorId = decodedToken?.doctorId || decodedToken?._id; // Adjust if your payload structure differs
        if (!doctorId) {
             console.error("verifyDoctorJWT - Error: No doctorId found in decoded token.");
             throw new ApiError(401, "Invalid token payload.");
        }

        const doctor = await Doctor.findById(doctorId); // Query using the extracted ID

        if (!doctor) {
            console.error(`verifyDoctorJWT - Error: Doctor not found for ID: ${doctorId}`);
            throw new ApiError(401, "Invalid access token. Doctor not found.");
        }

        console.log(`verifyDoctorJWT - Doctor Found: ${doctor.fullname} (${doctor._id})`);
        req.doctor = doctor; // Attach doctor object to request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("verifyDoctorJWT - Verification Error:", error.name, error.message); // Log any error during verification
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