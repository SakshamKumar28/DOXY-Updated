import io from 'socket.io-client';
import axios from 'axios';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, User, Video, VideoOff, Clock } from 'lucide-react';

// Custom API Error class
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const VideoCallComponent = ({ authenticatedUser, userRole }) => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();

    const [appointment, setAppointment] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [socketStatus, setSocketStatus] = useState('Initializing...');
    const [peerStatus, setPeerStatus] = useState('Idle');
    const [PeerLib, setPeerLib] = useState(null);
    const [hasLocalStream, setHasLocalStream] = useState(false);
    const [hasRemoteStream, setHasRemoteStream] = useState(false);

    // Refs
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);

    const currentUserId = authenticatedUser?._id;

    // Dynamic Import useEffect
    useEffect(() => {
        import('simple-peer')
            .then((module) => {
                const PeerConstructor = module.default || module.Peer || module;
                if (typeof PeerConstructor !== 'function') {
                    console.error("Failed to load Peer constructor from simple-peer module:", module);
                    setError("Failed to load video call library.");
                    setLoading(false);
                    return;
                }
                console.log("simple-peer library loaded successfully.");
                setPeerLib(() => PeerConstructor);
            })
            .catch((err) => {
                console.error("Error dynamically importing simple-peer:", err);
                setError("Failed to load video call library. Please check your connection and refresh.");
                setLoading(false);
            });
    }, []);

    // Fetch Appointment Details
    const fetchAppointmentDetails = useCallback(async () => {
        setError('');
        try {
            const response = await api.get(`/api/appointments/${appointmentId}`);
            if (!response.data?.success || !response.data?.data?.appointment) {
                throw new ApiError(404, 'Appointment details could not be loaded.');
            }
            const appt = response.data.data.appointment;
            setAppointment(appt);

            if (appt.user?._id !== currentUserId && appt.doctor?._id !== currentUserId) {
                throw new ApiError(403, "You are not authorized to join this call.");
            }
            if (!['Scheduled', 'Ongoing'].includes(appt.status)) {
                throw new ApiError(400, `This appointment is currently ${appt.status.toLowerCase()}. Call cannot be joined.`);
            }
            console.log("Appointment details fetched and validated successfully.");
            return true;
        } catch (err) {
            console.error("Failed to fetch/validate appointment:", err);
            const message = err instanceof ApiError ? err.message : (err.response?.data?.message || err.message || 'Failed to load appointment details.');
            setError(message);
            return false;
        }
    }, [appointmentId, currentUserId]);

    // Start Timer
    const startTimer = useCallback(() => {
        console.log("Starting call timer");
        setCallDuration(0);
        const intervalId = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return intervalId;
    }, []);

    // Format Time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Create Peer Function
    const createPeer = useCallback((socket, initiator, stream) => {
        if (!PeerLib) {
            console.error("Attempted to create peer before Peer library was loaded.");
            setError("Video library failed to load correctly.");
            return;
        }

        if (peerRef.current) {
            console.log("Destroying existing peer before creating new one.");
            if (typeof peerRef.current.destroy === 'function' && !peerRef.current.destroyed) {
                peerRef.current.destroy();
            }
            peerRef.current = null;
        }

        console.log(`Creating Peer using loaded library. Initiator: ${initiator}`);
        try {
            const peer = new PeerLib({
                initiator: initiator,
                trickle: true,
                stream: stream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            peer.on('signal', (signalData) => {
                if (!socketRef.current || socketRef.current.disconnected) return;
                console.log('Generated signal, sending to backend...');
                socketRef.current.emit('signal', { roomId: appointmentId, userId: currentUserId, signal: signalData });
            });

            peer.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                if (peerRef.current === peer && !peer.destroyed) {
                    setPeerStatus('Connected');
                    setHasRemoteStream(true);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        // Force play the video
                        remoteVideoRef.current.play().catch(err => {
                            console.error("Error playing remote video:", err);
                        });
                    }
                } else {
                    console.log("Received stream for an old/destroyed peer. Ignoring.");
                }
            });

            peer.on('connect', () => {
                if (peerRef.current === peer && !peer.destroyed) {
                    console.log('Peer connection established');
                    setPeerStatus('Connected');
                } else {
                    console.log("Connect event fired for an inactive/destroyed peer.");
                }
            });

            peer.on('close', () => {
                console.log('Peer connection closed');
                if (peerRef.current === peer) {
                    setPeerStatus('Disconnected');
                    setHasRemoteStream(false);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                    peerRef.current = null;
                } else {
                    console.log("Close event fired for an already replaced/destroyed peer.");
                }
            });

            peer.on('error', (err) => {
                console.error('Peer connection error:', err);
                if (peerRef.current === peer && !peer.destroyed) {
                    setError(`Connection error: ${err.message}. Please refresh.`);
                    setPeerStatus('Error');
                    if (typeof peer.destroy === 'function') peer.destroy();
                    peerRef.current = null;
                } else {
                    console.log("Error event fired for an inactive/destroyed peer.");
                }
            });

            peerRef.current = peer;

        } catch (peerError) {
            console.error("Error creating Peer instance:", peerError);
            setError("Failed to initialize video connection component. Please refresh.");
            setPeerStatus('Error');
        }
    }, [PeerLib, appointmentId, currentUserId]);

    // Main Logic useEffect
    useEffect(() => {
        if (!PeerLib) {
            console.log("Waiting for Peer library to load...");
            if (!loading && !error) setLoading(true);
            return;
        }

        if (!authenticatedUser || !userRole || !currentUserId) {
            setError("Authentication information missing. Cannot start call.");
            setLoading(false);
            console.error("VideoCall: authenticatedUser or userRole prop is missing!");
            return;
        }

        console.log(`VideoCall: Initializing for ${userRole} (${currentUserId}) using loaded Peer library.`);
        let timerIntervalId = null;
        let isMounted = true;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    console.log("Cleanup: Media stream stopped because component unmounted early.");
                    return;
                }
                localStreamRef.current = stream;
                setHasLocalStream(true);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    // Force play the video
                    localVideoRef.current.play().catch(err => {
                        console.error("Error playing local video:", err);
                    });
                    console.log("Local video stream attached and playing");
                } else {
                    console.warn("Local video ref not available immediately after getting stream.");
                }

                fetchAppointmentDetails().then(apptExists => {
                    if (!isMounted || !apptExists) {
                        setLoading(false);
                        if (localStreamRef.current) {
                            localStreamRef.current.getTracks().forEach(track => track.stop());
                            localStreamRef.current = null;
                            setHasLocalStream(false);
                            console.log("Cleanup: Media stream stopped due to invalid appointment or fetch error.");
                        }
                        return;
                    }

                    socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
                    const socket = socketRef.current;
                    setSocketStatus('Connecting...');

                    socket.on('connect', () => {
                        if (!isMounted) return;
                        setSocketStatus('Connected');
                        console.log('Socket connected:', socket.id);
                        if (appointmentId) {
                            socket.emit('join-room', appointmentId, currentUserId, userRole);
                            console.log(`Attempting to join room ${appointmentId} as ${userRole} ${currentUserId}`);
                        }
                    });

                    socket.on('connect_error', (err) => {
                        if (!isMounted) return;
                        setSocketStatus('Connection Failed');
                        setError(`Socket connection error: ${err.message}. Please check server and refresh.`);
                        console.error('Socket connection error:', err);
                    });

                    socket.on('disconnect', (reason) => {
                        if (!isMounted) return;
                        setSocketStatus(`Disconnected: ${reason}`);
                        console.log('Socket disconnected:', reason);
                        setPeerStatus('Disconnected');
                        setError('Lost connection to signaling server. Call ended.');
                        clearInterval(timerIntervalId);
                        if (localStreamRef.current) {
                            localStreamRef.current.getTracks().forEach(track => track.stop());
                        }
                        if (peerRef.current && !peerRef.current.destroyed) {
                            peerRef.current.destroy();
                        }
                    });

                    socket.on('user-joined', (joinedUserId, joinedUserRole) => {
                        if (!isMounted || joinedUserId === currentUserId) return;
                        console.log(`User ${joinedUserId} (${joinedUserRole || 'N/A'}) joined room. Initiating peer connection.`);
                        setPeerStatus('Connecting (Initiator)...');
                        const isInitiator = true;
                        if (localStreamRef.current) {
                            createPeer(socket, isInitiator, localStreamRef.current);
                        } else {
                            console.error("Cannot initiate peer: local stream not available.");
                            setError("Camera/Mic stream lost. Cannot connect.");
                        }
                    });

                    socket.on('signal', (payload) => {
                        if (!isMounted || payload.userId === currentUserId) return;
                        console.log('Received signal from:', payload.userId, 'Type:', payload.signal?.type);
                        const incomingSignal = payload.signal;

                        if (peerRef.current && !peerRef.current.destroyed) {
                            console.log('Signaling existing peer.');
                            peerRef.current.signal(incomingSignal);
                        } else {
                            if (incomingSignal && incomingSignal.type === 'offer' && !peerRef.current) {
                                console.log('No active peer, received offer. Creating receiver peer.');
                                setPeerStatus('Connecting (Receiver)...');
                                const isInitiator = false;
                                if (localStreamRef.current) {
                                    createPeer(socket, isInitiator, localStreamRef.current);
                                    // Wait a bit for peer to be created before signaling
                                    setTimeout(() => {
                                        if (peerRef.current && !peerRef.current.destroyed) {
                                            peerRef.current.signal(incomingSignal);
                                        }
                                    }, 100);
                                } else {
                                    console.error("Cannot create receiver peer: local stream not available.");
                                    setError("Camera/Mic stream lost. Cannot connect.");
                                }
                            } else {
                                console.warn("Received signal but peer is destroyed or signal type unexpected without an active peer. Ignoring.", incomingSignal?.type);
                            }
                        }
                    });

                    timerIntervalId = startTimer();
                    setLoading(false);

                }).catch(fetchErr => {
                    if (!isMounted) return;
                    console.error("Error during appointment fetch/validation:", fetchErr);
                    setLoading(false);
                    if (localStreamRef.current) {
                        localStreamRef.current.getTracks().forEach(track => track.stop());
                        localStreamRef.current = null;
                        setHasLocalStream(false);
                        console.log("Cleanup: Media stream stopped due to appointment fetch error.");
                    }
                });

            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Failed to get user media:", err);
                let mediaErrorMsg = "Camera/Microphone access denied or unavailable. Please check permissions.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    mediaErrorMsg = "Permission denied. Please allow camera and microphone access in your browser settings.";
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    mediaErrorMsg = "No camera or microphone found. Please connect a device and try again.";
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    mediaErrorMsg = "Camera/Microphone is already in use by another application. Please close other apps and try again.";
                }
                setError(mediaErrorMsg);
                setLoading(false);
            });

        return () => {
            isMounted = false;
            console.log("VideoCall Cleanup: Stopping timer, media, peer, socket.");
            clearInterval(timerIntervalId);
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            setHasLocalStream(false);
            setHasRemoteStream(false);
            if (peerRef.current && typeof peerRef.current.destroy === 'function' && !peerRef.current.destroyed) {
                peerRef.current.destroy();
            }
            peerRef.current = null;
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            socketRef.current = null;
        };
    }, [PeerLib, appointmentId, navigate, authenticatedUser, userRole, currentUserId, createPeer, fetchAppointmentDetails, startTimer, error]);

    // Handle End Call
    const handleEndCall = async () => {
        console.log("--- handleEndCall Triggered ---");
        const redirectPath = userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard';
        navigate(redirectPath);
    };

    // Toggle Audio
    const toggleAudio = () => {
        if (!localStreamRef.current) return;
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
            const newState = !isAudioOn;
            audioTracks[0].enabled = newState;
            setIsAudioOn(newState);
            console.log(`Audio ${newState ? 'unmuted' : 'muted'}`);
        }
    };

    // Toggle Video
    const toggleVideo = () => {
        if (!localStreamRef.current) return;
        const videoTracks = localStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
            const newState = !isVideoOn;
            videoTracks[0].enabled = newState;
            setIsVideoOn(newState);
            console.log(`Video ${newState ? 'enabled' : 'disabled'}`);
        }
    };

    // Loading State
    if (loading || !PeerLib) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-semibold">{PeerLib ? 'Loading Call...' : 'Loading Video Library...'}</p>
                <p className="text-xs text-gray-500 mt-2">{socketStatus}</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4">
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-xl font-bold mb-2 text-red-400">Call Error</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>Socket: {socketStatus}</p>
                        <p>Peer: {peerStatus}</p>
                    </div>
                    <button
                        onClick={() => navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard')}
                        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Participant Details
    const remoteParticipant = appointment ? (appointment.user?._id === currentUserId ? appointment.doctor : appointment.user) : null;
    const remoteParticipantName = remoteParticipant?.fullname || remoteParticipant?.fullName || 'Participant';
    const remoteParticipantDetail = remoteParticipant?.specialisation || (remoteParticipant ? 'Patient' : 'Connecting...');

    // Main Component Render
    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                    <div className={`flex items-center space-x-1 ${peerStatus === 'Connected' ? 'text-green-400' : 'text-yellow-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${peerStatus === 'Connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                        <span className="font-semibold">{peerStatus === 'Connected' ? 'LIVE' : 'CONNECTING'}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1 text-gray-300">
                        <Clock size={14} />
                        <span className="font-mono">{formatTime(callDuration)}</span>
                    </div>
                    <span className="text-gray-400 hidden md:inline">•</span>
                    <span className="text-xs text-gray-500 hidden md:inline">{socketStatus}</span>
                    <span className="text-gray-400 hidden md:inline">•</span>
                    <span className="text-xs text-gray-500 hidden md:inline">{peerStatus}</span>
                </div>
                <div className="text-white text-right flex items-center space-x-2">
                    <User size={16} />
                    <div>
                        <p className="font-semibold">{remoteParticipantName}</p>
                        <p className="text-xs text-gray-400">{remoteParticipantDetail}</p>
                    </div>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {/* Remote Video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    {/* Placeholder - shown when no remote stream */}
                    {!hasRemoteStream && (
                        <div className="text-center text-white">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={48} className="text-gray-400" />
                            </div>
                            <h2 className="text-lg md:text-xl font-semibold">{remoteParticipantName}</h2>
                            <p className="text-gray-400 text-sm">{remoteParticipantDetail}</p>
                            <p className="text-xs text-gray-500 mt-2">({peerStatus})</p>
                        </div>
                    )}
                    {/* Video Element */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover ${hasRemoteStream ? 'block' : 'hidden'}`}
                    />
                </div>

                {/* Self Video */}
                <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
                    {/* Video Element */}
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${hasLocalStream && isVideoOn ? 'block' : 'hidden'}`}
                    />
                    {/* Video Off Overlay */}
                    {hasLocalStream && !isVideoOn && (
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center">
                            <div className="text-center text-white text-xs">
                                <VideoOff size={24} className="mx-auto mb-1" />
                                <p>Video Off</p>
                            </div>
                        </div>
                    )}
                    {/* No Stream Overlay */}
                    {!hasLocalStream && (
                        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                            <div className="text-center text-white text-xs">
                                <User size={24} className="mx-auto mb-1" />
                                <p>Loading...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 px-6 py-4 md:py-6">
                <div className="flex items-center justify-center space-x-4">
                    {/* Audio Toggle Button */}
                    <button
                        onClick={toggleAudio}
                        disabled={!hasLocalStream}
                        className={`p-3 md:p-4 rounded-full transition-colors ${
                            isAudioOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                        disabled={!hasLocalStream}
                        className={`p-3 md:p-4 rounded-full transition-colors ${
                            isVideoOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                        className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        aria-label="End call"
                    >
                        <PhoneOff size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallComponent;