import Doctor from '../models/doctor.model.js'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validateAvailability, timeToMinutes } from '../utils/validators.js'

const issueDoctorToken = (res, doctor) => {
    const token = jwt.sign({ doctorId: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const options = { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 };
    return res.status(200).cookie('doctor_token', token, options)
        .json(new ApiResponse(200, { doctor: { _id: doctor._id, fullname: doctor.fullname, email: doctor.email } }, 'Doctor action successful!'));
};

export const registerDoctor = asyncHandler(async (req, res) => {
    const { fullname, email, phoneNumber, age, specialisation, experience, hospital, consultationFee, password } = req.body;

    if ([fullname, email, phoneNumber, age, specialisation, experience, hospital, consultationFee, password].some(v => v === undefined || String(v).trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const exists = await Doctor.findOne({ $or: [{ email }, { phoneNumber }] });
    if (exists) throw new ApiError(409, 'Doctor with email or phone already exists');

    const doctor = await Doctor.create({ fullname, email, phoneNumber, age, specialisation, experience, hospital, consultationFee, password });
    res.status(201).json(new ApiResponse(201, { doctorId: doctor._id }, 'Doctor registered successfully'));
});

export const loginDoctor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) throw new ApiError(404, 'Doctor not found');
    const ok = await doctor.comparePassword(password);
    if (!ok) throw new ApiError(401, 'Invalid credentials');
    return issueDoctorToken(res, doctor);
});

export const logoutDoctor = asyncHandler(async (req, res) => {
    res.clearCookie('doctor_token');
    res.status(200).json(new ApiResponse(200, {}, 'Doctor logged out successfully'));
});

export const getDoctorProfile = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.doctor, 'Doctor profile fetched'));
});

export const getallDoctors = asyncHandler(async (req, res) => {
    try {
        // Fetch only necessary fields for listing doctors
        const doctors = await Doctor.find().select(
            "fullname email phoneNumber age specialisation experience hospital consultationFee averageRating ratingCount"
        );
        // Changed response structure slightly to align with others
        res.status(200).json(new ApiResponse(200, doctors, 'All doctors fetched successfully'));
    } catch (error) {
        console.error("Error fetching all doctors:", error); // Log the actual error
        throw new ApiError(500, error?.message || 'Failed to fetch all doctors');
    }
});

// --- New Availability Controllers ---

/**
 * @description Get the availability schedule for the logged-in doctor
 * @route GET /api/auth/doctor/availability
 * @access Private (Doctor only)
 */
export const getDoctorAvailability = asyncHandler(async (req, res) => {
    // The doctor object is attached by verifyDoctorJWT middleware
    const doctor = await Doctor.findById(req.doctor._id).select('availability');

    if (!doctor) {
        throw new ApiError(404, "Doctor not found.");
    }

    res.status(200).json(new ApiResponse(
        200,
        doctor.availability,
        "Doctor availability fetched successfully"
    ));
});

/**
 * @description Update or set the availability schedule for the logged-in doctor
 * @route PUT /api/auth/doctor/availability
 * @access Private (Doctor only)
 * @body { availability: Array<{ dayOfWeek: number, slots: Array<{ start: string, end: string }> }> }
 */
export const updateDoctorAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body;

    // --- Use the validator ---
    const validationError = validateAvailability(availability);
    if (validationError) {
        throw new ApiError(400, validationError); // Throw a 400 Bad Request error if validation fails
    }
    // --- End validation ---

    // Ensure days are unique and sort slots just in case (optional, but good practice)
    const processedAvailability = availability.map(daySchedule => ({
        ...daySchedule,
        slots: daySchedule.slots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    })).sort((a, b) => a.dayOfWeek - b.dayOfWeek);


    const doctor = await Doctor.findByIdAndUpdate(
        req.doctor._id,
        // Use processedAvailability which might be sorted/cleaned
        { $set: { availability: processedAvailability } },
        { new: true, runValidators: true } // Return the updated doc and run schema validators
    ).select('availability'); // Only select the availability field

    if (!doctor) {
        throw new ApiError(404, "Doctor not found.");
    }

    res.status(200).json(new ApiResponse(
        200,
        doctor.availability,
        "Doctor availability updated successfully"
    ));
});




