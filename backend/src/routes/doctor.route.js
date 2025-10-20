import express from 'express';
import {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    getDoctorProfile,
    getallDoctors,          // Fetches ALL doctors
    getDoctorAvailability,
    updateDoctorAvailability
} from '../controllers/doctor.controller.js';

import { getDoctorAppointments } from '../controllers/appointment.controller.js';

// Import BOTH middleware functions
import { verifyDoctorJWT } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; // <-- ADD THIS IMPORT

const router = express.Router();

// --- Doctor Auth & Profile ---
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.post('/logout', verifyDoctorJWT, logoutDoctor); // Keep doctor auth for doctor actions
router.get('/me', verifyDoctorJWT, getDoctorProfile);  // Keep doctor auth for doctor actions

// --- Doctor-Specific Data ---
router.get('/appointments', verifyDoctorJWT, getDoctorAppointments); // Keep doctor auth

// --- Doctor Availability ---
router.route('/availability')
    .get(verifyDoctorJWT, getDoctorAvailability)      // Keep doctor auth
    .put(verifyDoctorJWT, updateDoctorAvailability);   // Keep doctor auth

// --- Public/User Accessible Doctor Data ---
// Route to get a list of ALL doctors (for patient booking)
// CHANGE: Use verifyJWT (user auth) instead of verifyDoctorJWT
router.get('/all', verifyJWT, getallDoctors); // <-- CHANGED MIDDLEWARE

export default router;