import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        trim: true,
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [1, "Age must be at least 1"],
        max: [120, "Age must be less than 120"]
    },
    address: {
        type: String,
        trim: true,
    },
    accountVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false // Hide this field from query results by default
    },
    verificationExpiry: {
        type: Date,
        select: false // Hide this field from query results by default
    }
}, { timestamps: true });

// TTL index to automatically clear expired verification data
userSchema.index({ "verificationExpiry": 1 }, { expireAfterSeconds: 0 });

/**
 * Generates a 5-digit verification code, hashes it, and sets its expiration.
 * @returns {string} The plain verification code to be sent to the user.
 */
userSchema.methods.generateVerificationCode = async function () {
    // Generate a 5-digit random number
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // Hash the code before saving
    const salt = await bcrypt.genSalt(10);
    this.verificationCode = await bcrypt.hash(code, salt);

    // Set expiration (10 minutes from now)
    this.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    return code;
};

/**
 * Verifies the provided code against the stored hash.
 * @param {string} candidateCode - The code submitted by the user.
 * @returns {Promise<boolean>} - True if the code is valid and not expired.
 */
userSchema.methods.verifyCode = async function (candidateCode) {
    // Check if code exists and hasn't expired
    if (!this.verificationCode || this.verificationExpiry < new Date()) {
        return false;
    }

    // Compare the provided code with the stored hash
    return await bcrypt.compare(candidateCode, this.verificationCode);
};

const User = mongoose.model('User', userSchema);
export default User;