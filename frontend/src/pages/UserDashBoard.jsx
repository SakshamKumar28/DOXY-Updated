import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Home, Calendar, Stethoscope, User, Bell, Search, Video, Phone, MessageCircle,
    Clock, Star, ChevronRight, Bot, FileText, Heart, Activity, Shield, LogOut
} from 'lucide-react';

// Configure your axios instance to connect to your backend
const api = axios.create({
    baseURL: import.meta.env.SERVER_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

// A simple loading spinner component
const FullPageLoader = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

const UserDashBoard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Fetch all necessary data when the component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [userRes, appointmentsRes, doctorsRes] = await Promise.all([
                    api.get('/auth/user/profile'),
                    // api.get('/appointments/upcoming'), // Assuming this endpoint exists
                    // api.get('/doctors/recent')         // Assuming this endpoint exists
                ]);

                setUser(userRes.data.data);
                setAppointments(appointmentsRes.data.data);
                setDoctors(doctorsRes.data.data);
                setError('');

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load your dashboard. Please try again later.");
                if (err.response?.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/user/logout');
            navigate('/login');
        } catch (err) {
            console.error("Logout failed:", err);
            setError("Logout failed. Please try again.");
        }
    };

    const quickActions = [
        { icon: <Bot className="w-6 h-6" />, title: 'AI Symptom Checker', subtitle: 'Check your symptoms', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
        { icon: <Video className="w-6 h-6" />, title: 'Video Consultation', subtitle: 'Talk to a doctor now', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
        { icon: <Calendar className="w-6 h-6" />, title: 'Book Appointment', subtitle: 'Schedule with specialist', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
        { icon: <FileText className="w-6 h-6" />, title: 'Medical Records', subtitle: 'View your history', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' }
    ];

    const navigationItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
        { id: 'profile', icon: User, label: 'Profile' }
    ];

    if (loading) {
        return <FullPageLoader />;
    }
    
    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h2>
                                <p className="text-green-100 mb-4">How are you feeling today?</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => (
                                    <div key={index} className={`${action.bgColor} rounded-2xl p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}>
                                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                                            {action.icon}
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                                        <p className="text-sm text-gray-600">{action.subtitle}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                 return (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                      <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user?.fullName?.[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{user?.fullName}</h3>
                            <p className="text-gray-600">{user?.email || 'No email provided'}</p>
                            <p className="text-gray-600">{user?.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                         <button
                           onClick={handleLogout}
                           className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600 transition-colors rounded-lg"
                         >
                           <div className="flex items-center space-x-4">
                             <LogOut className="w-6 h-6" />
                             <span className="font-semibold">Log Out</span>
                           </div>
                           <ChevronRight className="w-5 h-5" />
                         </button>
                       </div>
                    </div>
                  );
            default:
                return <div>Content for {activeTab}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl font-bold">D</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
                        </div>
                        <div className="flex space-x-8">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                        activeTab === item.id
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                                <Bell size={24} />
                            </button>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer" onClick={() => setActiveTab('profile')}>
                                {user?.fullName?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg font-bold">D</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="relative p-2 text-gray-600">
                            <Bell size={20} />
                        </button>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer" onClick={() => setActiveTab('profile')}>
                            {user?.fullName?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
                {renderContent()}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
                <div className="flex justify-around">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-gray-600'
                            }`}
                        >
                            <item.icon size={24} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default UserDashBoard;