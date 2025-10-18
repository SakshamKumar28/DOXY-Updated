import express from 'express'
import { registerDoctor, loginDoctor, logoutDoctor, getDoctorProfile, getallDoctors } from '../controllers/doctor.controller.js'
import { verifyDoctorJWT } from '../middlewares/auth.middleware.js'
import { getAppointments } from '../controllers/appointment.controller.js'

const router = express.Router()

router.post('/register', registerDoctor)
router.post('/login', loginDoctor)
router.post('/logout', logoutDoctor)
router.get('/me', verifyDoctorJWT, getDoctorProfile)
router.get('/appointments', verifyDoctorJWT, getAppointments)
router.get('/all', verifyDoctorJWT,getallDoctors)
export default router


