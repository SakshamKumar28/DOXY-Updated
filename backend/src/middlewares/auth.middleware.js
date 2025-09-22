import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // 1. Get the token from the user's cookies or authorization header
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request. Please log in.");
    }

    // 2. Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user in the database based on the token's payload
    const user = await User.findById(decodedToken?.userId).select("-verification"); // Exclude sensitive fields

    if (!user) {
        // This handles cases where the user might have been deleted but the token still exists
        throw new ApiError(401, "Invalid access token. User not found.");
    }

    // 4. Attach the user object to the request for use in subsequent controllers
    req.user = user;
    next();
});