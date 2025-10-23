// frontend/src/pages/VideoCall.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Clock, User, Stethoscope } from 'lucide-react'; // Added Stethoscope
import axios from 'axios';
import io from 'socket.io-client';
import Peer from 'simple-peer'; // Import simple-peer
import { useAuth } from '../hooks/useAuth'; // Import useAuth to get user ID

const api = axios.create({
    baseURL: 'http://localhost:3000', // Ensure this points to backend base
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const SOCKET_SERVER_URL = 'http://localhost:3000';

const VideoCall = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const { user: currentUser } = useAuth(); // Get current user info

    const [appointment, setAppointment] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [socketStatus, setSocketStatus] = useState('Initializing...');
    const [peerStatus, setPeerStatus] = useState('Idle'); // Track peer connection

    // Refs
    const socketRef = useRef(null);
    const localVideoRef = useRef(null); // Ref for self-view video element
    const remoteVideoRef = useRef(null); // Ref for participant's video element
    const peerRef = useRef(null); // Ref for the simple-peer instance
    const localStreamRef = useRef(null); // Ref to hold the local media stream

    const currentUserId = currentUser?._id; // Get ID from auth hook

    useEffect(() => {
        if (!currentUserId) {
            setError("Could not identify user. Please log in again.");
            setLoading(false);
            return; // Don't proceed without user ID
        }

        let timerIntervalId = null; // To store timer ID for cleanup

        // 1. Get User Media (Camera/Mic)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream; // Store the stream
                // Attach stream to local video element
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.style.display = 'block'; // Show local video
                }

                // Only proceed if media access is granted
                fetchAppointmentDetails(); // Fetch appointment details

                // 2. Initialize Socket Connection
                socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
                const socket = socketRef.current;
                setSocketStatus('Connecting...');

                socket.on('connect', () => {
                    setSocketStatus('Connected');
                    console.log('Socket connected:', socket.id);
                    if (appointmentId) {
                        socket.emit('join-room', appointmentId, currentUserId);
                        console.log(`Attempting to join room ${appointmentId} as user ${currentUserId}`);
                    }
                });

                // --- Socket Event Listeners ---
                socket.on('connect_error', (err) => { /* ... (error handling as before) ... */ });
                socket.on('disconnect', (reason) => { /* ... (disconnect handling as before) ... */ });

                socket.on('user-joined', (otherUserId) => {
                    console.log(`User ${otherUserId} joined the room. Initiating connection.`);
                    setPeerStatus('Connecting...');
                    // Create a peer connection (caller)
                    const isInitiator = true;
                    createPeer(socket, isInitiator, stream);
                });

                socket.on('signal', (payload) => {
                    console.log('Received signal from', payload.userId);
                    if (peerRef.current) {
                        // Pass the incoming signal to the existing peer instance
                        peerRef.current.signal(payload.signal);
                    } else {
                        // If no peer exists, create one (receiver)
                        console.log('No peer exists, creating receiver peer.');
                        setPeerStatus('Connecting...');
                        const isInitiator = false;
                        createPeer(socket, isInitiator, stream);
                        // Signal after peer is created (important for receiver)
                        if (peerRef.current) {
                            peerRef.current.signal(payload.signal);
                        }
                    }
                });

                // Start call timer after setup
                timerIntervalId = startTimer();

            })
            .catch(err => {
                console.error("Failed to get user media:", err);
                setError("Camera/Microphone access denied or unavailable. Please check permissions.");
                setLoading(false);
            });

        // --- Cleanup on component unmount ---
        return () => {
            clearInterval(timerIntervalId);
            // Stop camera/mic tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            // Destroy peer connection
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            console.log("Cleanup complete.");
        };
    }, [appointmentId, navigate, currentUserId]); // Add currentUserId

    // --- Function to Create Peer Connection ---
    const createPeer = (socket, initiator, stream) => {
        if (peerRef.current) {
            console.log("Destroying existing peer connection before creating new one.");
            peerRef.current.destroy(); // Destroy existing peer if any
        }

        console.log(`Creating Peer. Initiator: ${initiator}`);
        const peer = new Peer({
            initiator: initiator,
            trickle: true, // Use trickle ICE for faster connection
            stream: stream, // Provide the local stream immediately
        });

        peer.on('signal', (signalData) => {
            console.log('Generated signal, sending...');
            // Send the signal data via Socket.IO
            socket.emit('signal', {
                roomId: appointmentId,
                userId: currentUserId,
                signal: signalData,
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log('Received remote stream');
            setPeerStatus('Connected');
            // Attach remote stream to the remote video element
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.style.display = 'block'; // Show remote video
            }
        });

        peer.on('connect', () => {
            console.log('Peer connection established');
            setPeerStatus('Connected');
        });

        peer.on('close', () => {
            console.log('Peer connection closed');
            setPeerStatus('Disconnected');
            // Optionally reset remote video
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
                remoteVideoRef.current.style.display = 'none';
            }
            peerRef.current = null; // Clear the ref
        });

        peer.on('error', (err) => {
            console.error('Peer connection error:', err);
            setError(`Connection error: ${err.message}. Try refreshing.`);
            setPeerStatus('Error');
        });

        peerRef.current = peer; // Store the peer instance
    };

    // --- Other functions (fetchAppointmentDetails, startTimer, formatTime) remain similar ---
    const fetchAppointmentDetails = async () => { /* ... (as before) ... */ };
    const startTimer = () => { /* ... (as before) ... */ };
    const formatTime = (seconds) => { /* ... (as before) ... */ };


    // --- Modified handleEndCall for cleanup ---
    const handleEndCall = async () => {
        console.log("Ending call...");
        // Stop media tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        // Destroy peer connection
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        // --- Determine correct dashboard path ---
        // Check if currentUser has doctor-specific fields (like 'specialisation')
        // Or ideally, your useAuth hook should return a 'role' property
        const isDoctor = currentUser && currentUser.specialisation; // Adjust this check if needed
        const redirectPath = isDoctor ? '/doctor/dashboard' : '/dashboard';
        console.log(`Navigating to ${redirectPath} after call end.`);
        // -----------------------------------------

        // Navigate after cleanup
        navigate(redirectPath);
    };

    // --- Updated Media Control Functions ---
    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
                console.log("Audio Toggled:", audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
                console.log("Video Toggled:", videoTrack.enabled);
                // Show/hide local video placeholder if track is disabled/enabled
                if (localVideoRef.current) {
                    localVideoRef.current.style.visibility = videoTrack.enabled ? 'visible' : 'hidden';
                }
            }
        }
        // Toggle the visual state even if stream isn't ready yet
        else {
            setIsVideoOn(prev => !prev);
        }
    };

    // --- Loading and Error States (remain similar) ---
    if (loading) { /* ... (as before) ... */ }
    if (error) { /* ... (as before, maybe add peerStatus) ... */ }

    // --- Render Logic (remain similar, but assign refs to video elements) ---
    const remoteParticipant = appointment?.doctor?._id === currentUserId ? appointment?.user : appointment?.doctor;
    const remoteParticipantName = remoteParticipant?.fullname || remoteParticipant?.fullName || 'Participant'; // Handle both doctor/user names
    const remoteParticipantDetail = remoteParticipant?.specialisation || 'Patient'; // Show specialization or 'Patient'


    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* ... (Live indicator, Timer) ... */}
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{socketStatus}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{peerStatus}</span>
                </div>
                <div className="text-white text-sm md:text-base flex items-center">
                    {/* ... (Participant Name) ... */}
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video (Participant) */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    {/* Placeholder shown until stream is connected */}
                    <div className="text-center text-white" style={{ display: peerStatus !== 'Connected' ? 'block' : 'none' }}>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={48} />
                        </div>
                        <h2 className="text-lg md:text-xl font-semibold">{remoteParticipantName}</h2>
                        <p className="text-gray-400 text-sm">{remoteParticipantDetail}</p>
                        <p className="text-xs text-gray-500 mt-2">({peerStatus})</p>
                    </div>
                    {/* Actual Remote Video Stream */}
                    <video
                        ref={remoteVideoRef} // Assign ref
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ display: peerStatus === 'Connected' ? 'block' : 'none' }} // Show only when connected
                    />
                </div>

                {/* Self Video (User) */}
                <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
                    {/* Actual Local Video Stream */}
                    <video
                        ref={localVideoRef} // Assign ref
                        autoPlay
                        playsInline
                        muted // Mute self-view
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" // Flip horizontally
                        style={{ display: 'none' }} // Hidden initially, shown when stream is ready
                    />
                    {/* Overlay if video is off */}
                    {!isVideoOn && (
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                            <div className="text-center text-white text-xs">
                                <VideoOff size={24} className="mx-auto mb-1" />
                                Video Off
                            </div>
                        </div>
                    )}
                    {/* Placeholder if stream not ready */}
                    {!localStreamRef.current && (
                        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                            <div className="text-center text-white text-xs">
                                <User size={24} className="mx-auto mb-1" />
                                You
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 px-6 py-6">
                <div className="flex items-center justify-center space-x-4">
                    {/* Audio Toggle Button */}
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-colors ${isAudioOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                        aria-label={isAudioOn ? 'Mute audio' : 'Unmute audio'}
                    >
                        {isAudioOn ? (
                            <Mic size={24} className="text-white" />
                        ) : (
                            <MicOff size={24} className="text-white" />
                        )}
                    </button>

                    {/* Video Toggle Button */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${isVideoOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                        aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
                    >
                        {isVideoOn ? (
                            <Video size={24} className="text-white" />
                        ) : (
                            <VideoOff size={24} className="text-white" />
                        )}
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        aria-label="End call"
                    >
                        <PhoneOff size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;