import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const bookAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, time } = req.body;
    if (!doctorId || !date || !time) {
        throw new ApiError(400, 'Doctor ID, date, and time are required');
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }
    const appointment = await Appointment.create({ doctor: doctorId, date, time });
    res.status(201).json(new ApiResponse(201, { appointmentId: appointment._id }, 'Appointment booked successfully'));
});

export const getAppointments = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.doctor._id });
        res.status(200).json(new ApiResponse(200, { appointments }, 'Appointments fetched successfully'));
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch appointments');    
    }
});

export const getAppointment = asyncHandler(async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        res.status(200).json(new ApiResponse(200, { appointment }, 'Appointment fetched successfully'));
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch appointment');
    }
});
