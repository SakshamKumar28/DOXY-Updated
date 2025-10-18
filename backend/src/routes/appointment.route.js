import { Router } from 'express';
import { bookAppointment, getAppointments, getAppointment } from '../controllers/appointment.controller.js';
import { verifyDoctorJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/book', verifyDoctorJWT, bookAppointment);
router.get('/', verifyDoctorJWT, getAppointments);
router.get('/:appointmentId', verifyDoctorJWT, getAppointment);

export default router;