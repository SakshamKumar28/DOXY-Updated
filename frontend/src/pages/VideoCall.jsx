import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Clock, User } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const VideoCall = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointment();
        startTimer();
    }, []);

    const fetchAppointment = async () => {
        try {
            // Placeholder - replace with actual endpoint
            const mockAppointment = {
                _id: appointmentId,
                user: { fullName: 'John Doe' },
                doctor: { fullname: 'Dr. Sarah Johnson', specialisation: 'Cardiologist' },
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                status: 'Ongoing'
            };
            setAppointment(mockAppointment);
        } catch (err) {
            setError('Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = async () => {
        try {
            // Update appointment status to completed
            await api.patch(`/appointments/${appointmentId}`, { status: 'Completed' });
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to end call:', err);
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button onClick={() => navigate('/dashboard')} className="text-green-600 hover:text-green-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">Live Call</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{formatTime(callDuration)}</span>
                </div>
                <div className="text-white">
                    <Clock size={20} className="inline mr-2" />
                    {appointment?.doctor?.fullname}
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative">
                {/* Main Video (Doctor) */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={48} />
                        </div>
                        <h2 className="text-xl font-semibold">{appointment?.doctor?.fullname}</h2>
                        <p className="text-gray-400">{appointment?.doctor?.specialisation}</p>
                    </div>
                </div>

                {/* Self Video (User) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <User size={24} />
                            </div>
                            <p className="text-sm">You</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 px-6 py-6">
                <div className="flex items-center justify-center space-x-4">
                    {/* Audio Toggle */}
                    <button
                        onClick={() => setIsAudioOn(!isAudioOn)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                        }`}
                    >
                        {isAudioOn ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
                    </button>

                    {/* Video Toggle */}
                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                        }`}
                    >
                        {isVideoOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={handleEndCall}
                        className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all"
                    >
                        <PhoneOff size={24} className="text-white" />
                    </button>
                </div>

                {/* Call Info */}
                <div className="text-center mt-4 text-gray-400 text-sm">
                    <p>Appointment with {appointment?.doctor?.fullname}</p>
                    <p>Duration: {formatTime(callDuration)}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
