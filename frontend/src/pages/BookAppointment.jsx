import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, MapPin, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const BookAppointment = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            // Placeholder - replace with actual endpoint
            const response = await api.get('/auth/doctor/all');
            if (!response.data?.data) {
                throw new Error('Failed to load doctors');
            }
            setDoctors(response.data.data);
        } catch (err) {
            setError('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) {
            setError('Please select doctor, date, and time');
            return;
        }

        setBookingLoading(true);
        setError('');

        try {
            const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

            const appointmentData = {
                doctor: selectedDoctor._id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                type: 'Video'
            };

            // Placeholder - replace with actual endpoint
            console.log('Booking appointment:', appointmentData);

            // Simulate API call
            const response = await api.post('/appointments/book');

            if (response) {
                console.log('Appointment booked successfully')
            }
            navigate('/dashboard');


        } catch (err) {
            setError('Failed to book appointment');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Doctor Selection */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900">Select Doctor</h2>
                        <div className="space-y-4">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedDoctor?._id === doctor._id
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{doctor.fullname}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Stethoscope size={16} className="text-gray-500" />
                                                <span className="text-sm text-gray-600">{doctor.specialisation}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <MapPin size={16} className="text-gray-500" />
                                                <span className="text-sm text-gray-600">{doctor.hospital}</span>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="flex items-center space-x-1">
                                                    <Star size={16} className="text-yellow-500" />
                                                    <span className="text-sm font-medium">{doctor.averageRating}</span>
                                                    <span className="text-sm text-gray-500">({doctor.ratingCount})</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{doctor.experience} years exp.</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">₹{doctor.consultationFee}</div>
                                            <div className="text-sm text-gray-500">per session</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date & Time Selection */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900">Select Date & Time</h2>

                        {selectedDoctor ? (
                            <>
                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {generateTimeSlots().map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${selectedTime === time
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-green-300'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Appointment Summary */}
                                {selectedDate && selectedTime && (
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Appointment Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Doctor:</span>
                                                <span className="font-medium">{selectedDoctor.fullname}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Speciality:</span>
                                                <span className="font-medium">{selectedDoctor.specialisation}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium">{selectedTime} - {new Date(`2000-01-01T${selectedTime}:00`).getTime() + 60 * 60 * 1000 ? new Date(new Date(`2000-01-01T${selectedTime}:00`).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium">1 hour</span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                                <span>Total Fee:</span>
                                                <span className="text-green-600">₹{selectedDoctor.consultationFee}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Book Button */}
                                <button
                                    onClick={handleBookAppointment}
                                    disabled={!selectedDate || !selectedTime || bookingLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                                >
                                    {bookingLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Book Appointment
                                            <ArrowRight className="ml-2" size={20} />
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <User size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>Please select a doctor to continue</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookAppointment;
