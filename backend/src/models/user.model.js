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
    // Group verification fields in a nested object for clarity
    verification: {
        code: {
            type: String,
            // Hide this field from query results by default for security
            select: false,
        },
        expiresAt: {
            type: Date,
            select: false,
        }
    }
}, { timestamps: true });

// Use a TTL index to have MongoDB automatically clear the verification data
userSchema.index({ "verification.expiresAt": 1 }, { expireAfterSeconds: 0 });

/**
 * Generates a 5-digit verification code, hashes it, and sets its expiration.
 * @returns {string} The plain, unhashed verification code to be sent to the user.
 */
userSchema.methods.generateVerificationCode = async function () {
    // 1. Generate a simple 5-digit random number
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // 2. Hash the code before saving it to the database
    const salt = await bcrypt.genSalt(10);
    this.verification.code = await bcrypt.hash(code, salt);

    // 3. Set an expiration time (10 minutes from now)
    this.verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Return the plain code to be sent via SMS/email
    return code;
};

/**
 * Verifies the provided code against the stored hash.
 * @param {string} candidateCode - The code submitted by the user.
 * @returns {Promise<boolean>} - True if the code is valid and not expired.
 */
userSchema.methods.verifyCode = async function (candidateCode) {
    // Check if a code exists and if it has expired
    if (!this.verification.code || this.verification.expiresAt < new Date()) {
        return false;
    }

    // Compare the user's code with the stored hash
    return await bcrypt.compare(candidateCode, this.verification.code);
};


const User = mongoose.model('User', userSchema);
export default User;