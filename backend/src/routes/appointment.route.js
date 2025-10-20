import { Router } from 'express';
import {
    bookAppointment,
    getAppointment,
    getDoctorAppointments,
    getUserAppointments, // <-- IMPORT THIS
    confirmAppointment,
    rejectAppointment
} from '../controllers/appointment.controller.js';
import { verifyDoctorJWT } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// --- User-specific routes ---
router.post('/book', verifyJWT, bookAppointment);
router.get('/user/all', verifyJWT, getUserAppointments); // <-- ADD THIS ROUTE

// --- Doctor-specific routes ---
router.get('/doctor/all', verifyDoctorJWT, getDoctorAppointments);
router.put('/:appointmentId/confirm', verifyDoctorJWT, confirmAppointment);
router.put('/:appointmentId/reject', verifyDoctorJWT, rejectAppointment);

// --- Shared route (authorization handled in controller) ---
router.get('/:appointmentId', verifyJWT, getAppointment);


export default router;
