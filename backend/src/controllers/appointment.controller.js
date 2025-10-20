import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @description Allows a user to book an appointment (status defaults to Pending)
 * @route POST /api/appointments/book
 * @access Private (User)
 */
export const bookAppointment = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User authentication required to book appointment.");
    }

    const { doctorId, startTime } = req.body;

    if (!doctorId || !startTime) {
        throw new ApiError(400, 'Doctor ID and start time are required');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    // TODO: Add conflict checking against doctor's availability and existing appointments

    const appointmentData = {
        user: userId,
        doctor: doctorId,
        startTime: new Date(startTime),
        status: 'Pending'
    };

    const appointment = await Appointment.create(appointmentData);

    res.status(201).json(new ApiResponse(
        201,
        { appointmentId: appointment._id, status: appointment.status },
        'Appointment request submitted successfully. Waiting for doctor confirmation.'
    ));
});

/**
 * @description Get all appointments for the logged-in doctor
 * @route GET /api/appointments/doctor/all
 * @access Private (Doctor only)
 */
 export const getDoctorAppointments = asyncHandler(async (req, res) => {
    const doctorId = req.doctor._id;

    try {
        const appointments = await Appointment.find({ doctor: doctorId })
            .populate('user', 'fullName phoneNumber')
            .sort({ startTime: -1 });

        res.status(200).json(new ApiResponse(
            200,
            { appointments },
            'Doctor appointments fetched successfully'
        ));
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch doctor appointments');
    }
});

/**
 * @description Get all appointments for the logged-in user
 * @route GET /api/appointments/user/all
 * @access Private (User only)
 */
export const getUserAppointments = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const appointments = await Appointment.find({ user: userId })
            .populate('doctor', 'fullname specialisation') // Populate doctor details
            .sort({ startTime: -1 });

        res.status(200).json(new ApiResponse(
            200,
            { appointments },
            'User appointments fetched successfully'
        ));
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch user appointments');
    }
});


export const getAppointment = asyncHandler(async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .populate('user', 'fullName phoneNumber')
            .populate('doctor', 'fullname specialisation');
        if (!appointment) {
            throw new ApiError(404, 'Appointment not found');
        }
        res.status(200).json(new ApiResponse(200, { appointment }, 'Appointment fetched successfully'));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Failed to fetch appointment');
    }
});


/**
 * @description Doctor confirms a pending appointment
 * @route PUT /api/appointments/:appointmentId/confirm
 * @access Private (Doctor only)
 */
export const confirmAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found.");
    }

    if (appointment.doctor.toString() !== doctorId.toString()) {
        throw new ApiError(403, "You are not authorized to modify this appointment.");
    }
    if (appointment.status !== 'Pending') {
        throw new ApiError(400, `Appointment is already ${appointment.status.toLowerCase()}, cannot confirm.`);
    }

    appointment.status = 'Scheduled';
    await appointment.save();

    res.status(200).json(new ApiResponse(
        200,
        { appointmentId: appointment._id, status: appointment.status },
        "Appointment confirmed successfully."
    ));
});

/**
 * @description Doctor rejects a pending appointment
 * @route PUT /api/appointments/:appointmentId/reject
 * @access Private (Doctor only)
 */
export const rejectAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found.");
    }

    if (appointment.doctor.toString() !== doctorId.toString()) {
        throw new ApiError(403, "You are not authorized to modify this appointment.");
    }
    if (appointment.status !== 'Pending') {
        throw new ApiError(400, `Appointment is already ${appointment.status.toLowerCase()}, cannot reject.`);
    }

    appointment.status = 'Rejected';
    await appointment.save();

    res.status(200).json(new ApiResponse(
        200,
        { appointmentId: appointment._id, status: appointment.status },
        "Appointment rejected successfully."
    ));
});
