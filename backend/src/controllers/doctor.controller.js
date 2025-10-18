import Doctor from '../models/doctor.model.js'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const issueDoctorToken = (res, doctor) => {
    const token = jwt.sign({ doctorId: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };
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
        const doctors = await Doctor.find();
        res.status(200).json(new ApiResponse(200, { doctors }, 'All doctors fetched successfully'));
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch all doctors');
    }
});


