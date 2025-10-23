import io from 'socket.io-client';
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Stethoscope, User, Video, VideoOff } from 'lucide-react';
// --- Potentially problematic import ---
// Browsers might struggle with the default import if the library isn't CJS/ESM compatible for browsers without specific bundling steps.
// Let's try importing the browser version explicitly if available,
// or adjust bundling if needed. For now, we'll assume the standard import
// should work after environment correction.
import Peer from 'simple-peer';
// Remove useAuth import - we get user info via props now
// import { useAuth } from '../hooks/useAuth';

const api = axios.create({
    baseURL: 'http://localhost:3000', // Ensure this points to backend base
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const SOCKET_SERVER_URL = 'http://localhost:3000'; // Make sure this matches your backend port preference

// Receive authenticatedUser and userRole as props
const VideoCall = ({ authenticatedUser, userRole }) => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();

    // Remove the local useAuth call
    // const { user: currentUser } = useAuth();

    const [appointment, setAppointment] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [socketStatus, setSocketStatus] = useState('Initializing...');
    const [peerStatus, setPeerStatus] = useState('Idle');

    // Refs
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);

    // Use the ID from the prop
    const currentUserId = authenticatedUser?._id;

    useEffect(() => {
        // Essential check: Make sure we have the user info from props
        if (!authenticatedUser || !userRole || !currentUserId) {
            setError("Authentication information missing. Cannot start call.");
            setLoading(false);
            console.error("VideoCall: authenticatedUser or userRole prop is missing!");
            return;
        }

        console.log(`VideoCall: Initializing for ${userRole} (${currentUserId})`);

        let timerIntervalId = null;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.style.display = 'block';
                }

                fetchAppointmentDetails();

                socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
                const socket = socketRef.current;
                setSocketStatus('Connecting...');

                socket.on('connect', () => {
                    setSocketStatus('Connected');
                    console.log('Socket connected:', socket.id);
                    if (appointmentId) {
                        socket.emit('join-room', appointmentId, currentUserId, userRole);
                        console.log(`Attempting to join room ${appointmentId} as ${userRole} ${currentUserId}`);
                    }
                });

                socket.on('connect_error', (err) => {
                     setSocketStatus('Connection Failed');
                     setError(`Socket connection error: ${err.message}`);
                     console.error('Socket connection error:', err);
                 });
                socket.on('disconnect', (reason) => {
                     setSocketStatus(`Disconnected: ${reason}`);
                     console.log('Socket disconnected:', reason);
                 });

                socket.on('user-joined', (joinedUserId, joinedUserRole) => {
                    if (joinedUserId === currentUserId) return;
                    console.log(`User ${joinedUserId} (${joinedUserRole || 'N/A'}) joined room. Initiating connection.`);
                    setPeerStatus('Connecting...');
                    const isInitiator = true;
                    createPeer(socket, isInitiator, stream);
                });

                socket.on('signal', (payload) => {
                    if (payload.userId === currentUserId) return; // Ignore signals from self
                    console.log('Received signal from', payload.userId);
                    const incomingSignal = payload.signal;

                    if (peerRef.current && !peerRef.current.destroyed) {
                        peerRef.current.signal(incomingSignal);
                    } else {
                        if (incomingSignal.type === 'offer' || !peerRef.current) {
                             console.log('No active peer, creating receiver peer.');
                            setPeerStatus('Connecting...');
                            const isInitiator = false;
                            createPeer(socket, isInitiator, stream);
                             // Need a slight delay for the peer object to be ready before signaling
                            setTimeout(() => {
                                if (peerRef.current && !peerRef.current.destroyed) {
                                    peerRef.current.signal(incomingSignal);
                                }
                            }, 100);
                        } else {
                            console.warn("Received signal but peer is destroyed or signal type unexpected. Ignoring.");
                        }
                    }
                });

                timerIntervalId = startTimer();

            })
            .catch(err => {
                console.error("Failed to get user media:", err);
                setError("Camera/Microphone access denied or unavailable. Please check permissions.");
                setLoading(false);
            });

        return () => {
             console.log("VideoCall Cleanup: Stopping timer, media, peer, socket.");
            clearInterval(timerIntervalId);
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [appointmentId, navigate, authenticatedUser, userRole, currentUserId]); // Ensure props are dependencies

    const createPeer = (socket, initiator, stream) => {
        if (peerRef.current && !peerRef.current.destroyed) {
             console.log("Destroying existing valid peer connection before creating new one.");
             peerRef.current.destroy();
        }
        peerRef.current = null; // Clear ref

        console.log(`Creating Peer. Initiator: ${initiator}`);
        const peer = new Peer({
            initiator: initiator,
            trickle: true,
            stream: stream,
        });

        peer.on('signal', (signalData) => {
            console.log('Generated signal, sending...');
            socket.emit('signal', {
                roomId: appointmentId,
                userId: currentUserId,
                signal: signalData,
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log('Received remote stream');
             // Ensure the peer hasn't been destroyed in the meantime
            if (peerRef.current === peer && !peer.destroyed) {
                setPeerStatus('Connected');
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.style.display = 'block';
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
                  console.log('Peer connected but is no longer the active peer instance.');
             }
        });

        peer.on('close', () => {
             console.log('Peer connection closed');
              if (peerRef.current === peer) {
                  setPeerStatus('Disconnected');
                  if (remoteVideoRef.current) {
                      remoteVideoRef.current.srcObject = null;
                      remoteVideoRef.current.style.display = 'none';
                  }
                  peerRef.current = null;
              } else {
                   console.log('An older peer instance closed.');
              }
         });

        peer.on('error', (err) => {
             console.error('Peer connection error:', err);
             if (peerRef.current === peer && !peer.destroyed) {
                 setError(`Connection error: ${err.message}. Try refreshing.`);
                 setPeerStatus('Error');
             }
        });

        peerRef.current = peer;
    };

    const fetchAppointmentDetails = async () => {
        // setLoading(true); // setLoading is already true from initial state or parent effect
        setError('');
        try {
            const response = await api.get(`/api/appointments/${appointmentId}`);
            if (!response.data?.success || !response.data?.data?.appointment) {
                throw new Error('Appointment not found or invalid response');
            }
            const appt = response.data.data.appointment;
            setAppointment(appt);

            if (appt.user?._id !== currentUserId && appt.doctor?._id !== currentUserId) {
                 throw new Error("You are not authorized to join this call.");
            }

            if (!['Scheduled', 'Ongoing'].includes(appt.status)) {
                 setError('This call is not currently active or has ended.');
                 // Optionally clear stream and disconnect peer/socket early?
            }
        } catch (err) {
             console.error("Failed to fetch appointment:", err);
             setError(err.response?.data?.message || err.message || 'Failed to load appointment details');
        } finally {
            // Only set loading false if it was the initial load,
            // subsequent fetches shouldn't reset the main loading state
             if(loading) setLoading(false);
        }
    };


    const startTimer = () => {
        const intervalId = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return intervalId;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Corrected handleEndCall using userRole prop ---
    const handleEndCall = async () => {
        console.log("--- handleEndCall ---");
        console.log("userRole prop received:", userRole); // Add this log
        console.log("authenticatedUser prop ID:", authenticatedUser?._id); // Add this log

        console.log("Ending call procedure...");
        // Stop media tracks FIRST
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                 console.log(`Stopping track: ${track.kind}`);
                 track.stop();
            });
            localStreamRef.current = null; // Clear ref
        } else {
             console.log("No local stream found to stop.");
        }

        // Destroy peer connection
        if (peerRef.current && !peerRef.current.destroyed) {
             console.log("Destroying peer connection...");
            peerRef.current.destroy();
        } else {
             console.log("No active peer connection to destroy.");
        }
        peerRef.current = null; // Clear ref regardless

        // Disconnect socket
        if (socketRef.current && socketRef.current.connected) {
             console.log("Disconnecting socket...");
            socketRef.current.disconnect();
        } else {
             console.log("No active socket connection to disconnect.");
        }
        socketRef.current = null; // Clear ref regardless


        // --- Use userRole prop for navigation ---
        const redirectPath = userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard';
        console.log(`Navigating to ${redirectPath} after call end.`);
        // -----------------------------------------

        navigate(redirectPath); // Navigate after cleanup attempt
    };


    const toggleAudio = () => { /* ... (as before) ... */ };
    const toggleVideo = () => { /* ... (as before) ... */ };

     if (!authenticatedUser && !loading) { // Check if props are missing after initial load attempt
         return (
             <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">
                 Authentication Error. Cannot load call details.
             </div>
         );
     }


    if (loading) {
         return (
             <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                 <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mb-4"></div>
                 Loading Call...
                 <p className="text-xs text-gray-500 mt-2">{socketStatus}</p>
             </div>
         );
     }
    if (error) {
         return (
             <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                 <div className="text-center p-6 bg-gray-800 rounded-lg max-w-sm">
                     <p className="text-red-500 mb-4">{error}</p>
                     <button onClick={() => navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard')} className="text-green-500 hover:text-green-400 text-sm">
                         Back to Dashboard
                     </button>
                     <p className="text-xs text-gray-500 mt-4">Socket: {socketStatus} | Peer: {peerStatus}</p>
                 </div>
             </div>
         );
     }

    // Determine remote participant using authenticatedUser prop
    const remoteParticipant = appointment
        ? (appointment.user?._id === currentUserId ? appointment.doctor : appointment.user)
        : null;
    const remoteParticipantName = remoteParticipant?.fullname || remoteParticipant?.fullName || 'Participant';
    const remoteParticipantDetail = remoteParticipant?.specialisation || (remoteParticipant ? 'Patient' : 'Connecting...');


    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
             <div className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                    <div className="flex items-center space-x-1">
                         <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
                         <span className="text-white font-semibold hidden sm:inline">Live</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{formatTime(callDuration)}</span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-500 hidden sm:inline" title={`Socket: ${socketStatus}`}>Sock: {socketStatus.substring(0,4)}..</span>
                     <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-500 hidden sm:inline" title={`Peer: ${peerStatus}`}>Peer: {peerStatus}</span>
                </div>
                <div className="text-white text-right flex items-center">
                     {remoteParticipant?.specialisation ? <Stethoscope size={14} className="inline mr-1 opacity-75" /> : <User size={14} className="inline mr-1 opacity-75" />}
                    <span className="truncate max-w-[150px] md:max-w-xs">{remoteParticipantName}</span>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                     <div className="text-center text-white" style={{ display: peerStatus !== 'Connected' ? 'block' : 'none' }}>
                         <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-600">
                             <User size={48} className="text-gray-500"/>
                         </div>
                         <h2 className="text-lg md:text-xl font-semibold">{remoteParticipantName}</h2>
                         <p className="text-gray-400 text-sm">{remoteParticipantDetail}</p>
                         <p className="text-xs text-gray-500 mt-2 animate-pulse">{peerStatus}...</p>
                    </div>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover bg-black" // Added bg-black
                        style={{ display: peerStatus === 'Connected' ? 'block' : 'none' }}
                        onError={(e) => console.error("Remote video error:", e)} // Add error handler
                    />
                </div>

                {/* Self Video */}
                <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] bg-black" // Added bg-black
                        style={{ display: localStreamRef.current ? 'block' : 'none', visibility: isVideoOn ? 'visible' : 'hidden' }} // Control visibility
                        onError={(e) => console.error("Local video error:", e)} // Add error handler
                    />
                     {/* Overlay if video is off */}
                     {!isVideoOn && localStreamRef.current && (
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
            <div className="bg-gray-800 px-6 py-4 md:py-6">
                 <div className="flex items-center justify-center space-x-4">
                     {/* Audio Toggle Button */}
                    <button
                        onClick={toggleAudio}
                        className={`p-3 md:p-4 rounded-full transition-colors ${isAudioOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                        aria-label={isAudioOn ? 'Mute audio' : 'Unmute audio'}
                    >
                        {isAudioOn ? (
                            <Mic size={20} md:size={24} className="text-white" />
                        ) : (
                            <MicOff size={20} md:size={24} className="text-white" />
                        )}
                    </button>

                    {/* Video Toggle Button */}
                    <button
                        onClick={toggleVideo}
                        className={`p-3 md:p-4 rounded-full transition-colors ${isVideoOn
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                        aria-label={isVideoOn ? 'Turn off video' : 'Turn on video'}
                    >
                        {isVideoOn ? (
                            <Video size={20} md:size={24} className="text-white" />
                        ) : (
                            <VideoOff size={20} md:size={24} className="text-white" />
                        )}
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={handleEndCall}
                        className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        aria-label="End call"
                    >
                        <PhoneOff size={20} md:size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;

