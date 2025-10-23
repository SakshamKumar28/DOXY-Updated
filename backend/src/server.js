// backend/src/server.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // Import the http module
import { Server } from 'socket.io'; // Import Server from socket.io
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import doctorRoutes from './routes/doctor.route.js';
import appointmentRoutes from './routes/appointment.route.js';
// Import authentication middleware if needed for Socket.IO connections
// import { verifyJWT, verifyDoctorJWT } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const io = new Server(server, { // Initialize Socket.IO with the HTTP server
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const PORT = process.env.PORT || 3000;


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/auth/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room (appointment)
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} (${socket.id}) joined room ${roomId}`);
        // Notify others in the room (optional, useful for knowing who joined)
        socket.to(roomId).emit('user-joined', userId);
    });

    // Handle signaling messages (offer, answer, ice-candidate)
    socket.on('signal', (payload) => {
        console.log(`Signal received from ${payload.userId} in room ${payload.roomId}`);
        // Relay the signal to others in the same room EXCEPT the sender
        io.to(payload.roomId).emit('signal', {
            userId: payload.userId,
            signal: payload.signal,
        });
    });

    // Handle leaving a room / disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // You might need logic here to notify others in the rooms the user was in
        // For simplicity, we'll skip this for now, but in a real app, you'd handle it.
    });
});


// --- Server Start ---
connectDB().then(() => {
    console.log('Database connected successfully');
    // Start the HTTP server (which includes Socket.IO) instead of the Express app directly
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed', err);
    process.exit(1);
});