import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Calendar, Video, FileText, User, Star, LogOut, Clock,
    IndianRupee, Stethoscope, Plus, Trash2, Save, ArrowLeft, Settings,
    Check, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
    baseURL: 'http://localhost:3000', // Base URL now just the server root
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const MiniLoader = ({ size = 'w-4 h-4' }) => <div className={`${size} border-2 border-gray-400 border-t-transparent rounded-full animate-spin`}></div>;


const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');

    const [availability, setAvailability] = useState([]);
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');

    const [actionLoading, setActionLoading] = useState({});

    const fetchData = async (isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
        }
        setError('');
        setAvailabilityError('');

        try {
            const [doctorRes, appointmentsRes, availabilityRes] = await Promise.all([
                api.get('/api/auth/doctor/me'),
                api.get('/api/appointments/doctor/all'),
                api.get('/api/auth/doctor/availability')
            ]);

            if (!doctorRes.data?.data) throw new Error('No doctor data received');
            setDoctor(doctorRes.data.data);
            setAppointments(appointmentsRes.data?.data?.appointments || []);
            setAvailability(availabilityRes.data?.data || []);

        } catch (e) {
            console.error("Dashboard fetch error:", e);
            setError('Failed to load dashboard data. Please refresh.');
            if (e.response?.status === 401) {
                navigate('/doctor/login');
            }
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData(true);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/doctor/logout');
            navigate('/');
        } catch (e) {
            console.error("Logout failed:", e);
            setError("Logout failed. Please try again.");
        }
    };

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const handleAddTimeSlot = (dayIndex) => {
        const updatedAvailability = JSON.parse(JSON.stringify(availability));
        let daySchedule = updatedAvailability.find(d => d.dayOfWeek === dayIndex);
        const newSlot = { start: "09:00", end: "10:00" };
        if (daySchedule) {
            daySchedule.slots.push(newSlot);
            daySchedule.slots.sort((a, b) => a.start.localeCompare(b.start));
        } else {
            updatedAvailability.push({ dayOfWeek: dayIndex, slots: [newSlot] });
            updatedAvailability.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        }
        setAvailability(updatedAvailability);
    };

    const handleRemoveTimeSlot = (dayIndex, slotIndex) => {
        const updatedAvailability = JSON.parse(JSON.stringify(availability));
        let daySchedule = updatedAvailability.find(d => d.dayOfWeek === dayIndex);
        if (daySchedule && daySchedule.slots.length > slotIndex) {
            daySchedule.slots.splice(slotIndex, 1);
            setAvailability(updatedAvailability);
        }
    };

    const handleTimeChange = (dayIndex, slotIndex, type, value) => {
        const updatedAvailability = JSON.parse(JSON.stringify(availability));
        let daySchedule = updatedAvailability.find(d => d.dayOfWeek === dayIndex);
        if (daySchedule && daySchedule.slots[slotIndex]) {
            daySchedule.slots[slotIndex][type] = value;
            setAvailability(updatedAvailability);
        }
    };

    const handleSaveAvailability = async () => {
        setAvailabilityLoading(true);
        setAvailabilityError('');
        try {
            const res = await api.put('/api/auth/doctor/availability', { availability });
            setAvailability(res.data?.data || []);
            setIsEditingAvailability(false);
            alert("Availability saved successfully!");
        } catch (err) {
            console.error("Failed to save availability:", err);
            setAvailabilityError(err.response?.data?.message || 'Failed to save schedule. Check for overlapping times or invalid formats.');
        } finally {
            setAvailabilityLoading(false);
        }
    };
    
    const handleCancelEditAvailability = async () => {
         setIsEditingAvailability(false);
         setAvailabilityError('');
         try {
             setAvailabilityLoading(true);
             const availabilityRes = await api.get('/api/auth/doctor/availability');
             setAvailability(availabilityRes.data?.data || []);
         } catch (e) {
             setAvailabilityError('Could not reload original schedule.');
         } finally {
             setAvailabilityLoading(false);
         }
     };

     const handleAppointmentAction = async (apptId, action) => {
        setActionLoading(prev => ({ ...prev, [apptId]: true }));
        setError('');
        const url = `/api/appointments/${apptId}/${action}`;
        try {
            await api.put(url);
            await fetchData();
            alert(`Appointment ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully!`);
        } catch (err) {
            console.error(`Failed to ${action} appointment:`, err);
            setError(err.response?.data?.message || `Failed to ${action} the appointment. Please try again.`);
        } finally {
            setActionLoading(prev => ({ ...prev, [apptId]: false }));
        }
    };

    const getTodaysAppointments = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return appointments.filter(appt => {
            const apptDate = new Date(appt.startTime);
            return apptDate >= today && apptDate < tomorrow && (appt.status === 'Scheduled' || appt.status === 'Ongoing');
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    };

    const getPendingAppointments = () => {
        return appointments.filter(appt => appt.status === 'Pending')
                           .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    };

    const todaysAppointments = getTodaysAppointments();
    const pendingAppointments = getPendingAppointments();

    if (loading) return <div className="h-screen flex items-center justify-center"><MiniLoader size="w-16 h-16"/> Loading Dashboard...</div>;
    if (error && !loading) return <div className="h-screen flex items-center justify-center text-red-600 p-4 text-center">{error} <button onClick={() => fetchData(true)} className="ml-2 px-2 py-1 border rounded text-sm">Retry</button></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                     <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveView('overview')}>
                         <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                             <span className="text-white text-xl font-bold">D</span>
                         </div>
                         <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
                     </div>
                     <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                         <LogOut size={20} />
                         <span className="font-semibold">Log Out</span>
                     </button>
                 </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                 <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                     <div className="relative z-10">
                        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {doctor?.fullname || 'Doctor'}</h1>
                        <p className="text-green-100">Here's your practice overview</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
                             <div className="bg-white/10 rounded-2xl p-3">
                                 <div className="text-xs text-green-100">Today's Active</div>
                                 <div className="text-xl font-bold flex items-center"><Clock className="w-4 h-4 mr-1"/> {todaysAppointments.length || 0}</div>
                             </div>
                              <div className="bg-white/10 rounded-2xl p-3">
                                <div className="text-xs text-green-100">Avg. Rating</div>
                                <div className="text-xl font-bold flex items-center"><Star className="w-4 h-4 mr-1"/> {(doctor?.averageRating ?? 0).toFixed(1)}</div>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3">
                                <div className="text-xs text-green-100">Fee</div>
                                <div className="text-xl font-bold flex items-center"><IndianRupee className="w-4 h-4 mr-1"/> {doctor?.consultationFee ?? 0}</div>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3">
                                <div className="text-xs text-green-100">Speciality</div>
                                <div className="text-xl font-bold flex items-center"><Stethoscope className="w-4 h-4 mr-1"/> {doctor?.specialisation || '-'}</div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-3 gap-6">
                      <button onClick={() => setActiveView('profile')} className={`bg-white rounded-2xl border p-6 text-left hover:shadow-md transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'profile' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-100'}`} disabled={activeView === 'profile'}>
                         <div className="flex items-center space-x-3 mb-4"><Settings className="text-green-600" /><h2 className="font-semibold text-gray-900">Profile & Settings</h2></div>
                         <p className="text-sm text-gray-600">Manage availability, fees, and profile information.</p>
                     </button>
                      <button onClick={() => setActiveView('appointments')} className={`bg-white rounded-2xl border p-6 text-left hover:shadow-md transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'appointments' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-100'}`} disabled={activeView === 'appointments'}>
                         <div className="flex items-center space-x-3 mb-4"><Calendar className="text-green-600" /><h2 className="font-semibold text-gray-900">All Appointments</h2></div>
                         <p className="text-sm text-gray-600">View all upcoming and past video calls.</p>
                     </button>
                      <button onClick={() => setActiveView('reviews')} className={`bg-white rounded-2xl border p-6 text-left hover:shadow-md transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'reviews' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-100'}`} disabled={activeView === 'reviews'}>
                         <div className="flex items-center space-x-3 mb-4"><Star className="text-green-600" /><h2 className="font-semibold text-gray-900">Reviews</h2></div>
                         <p className="text-sm text-gray-600">See patient feedback and ratings.</p>
                     </button>
                 </div>

                {activeView !== 'overview' && (
                     <div className="mb-4">
                        <button onClick={() => setActiveView('overview')} className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                             <ArrowLeft size={16} className="mr-1" /> Back to Overview
                        </button>
                    </div>
                )}

                {activeView === 'appointments' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">All Appointments (Upcoming & Past)</h2>
                        <div className="divide-y divide-gray-100">
                            {appointments.length === 0 ? (
                                <div className="text-gray-500 text-sm py-2">No appointments found.</div>
                            ) : (
                                appointments
                                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                                    .map((appt) => (
                                    <div key={appt._id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900">{appt.user?.fullName || 'Patient'}</div>
                                            <div className="text-sm text-gray-600">
                                                {new Date(appt.startTime).toLocaleDateString()}
                                                {' @ '}
                                                {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                appt.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                appt.status === 'Cancelled' || appt.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                             }`}>{appt.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'profile' && (
                     <div className="bg-white rounded-2xl border border-gray-100 p-6">
                         <div className="mb-6 pb-6 border-b">
                             <h2 className="font-semibold text-lg text-gray-900 mb-4">Profile Information</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                 <p><strong className="text-gray-600">Name:</strong> {doctor?.fullname}</p>
                                 <p><strong className="text-gray-600">Email:</strong> {doctor?.email}</p>
                                 <p><strong className="text-gray-600">Phone:</strong> {doctor?.phoneNumber}</p>
                                 <p><strong className="text-gray-600">Age:</strong> {doctor?.age}</p>
                                 <p><strong className="text-gray-600">Specialisation:</strong> {doctor?.specialisation}</p>
                                 <p><strong className="text-gray-600">Experience:</strong> {doctor?.experience} years</p>
                                 <p><strong className="text-gray-600">Hospital:</strong> {doctor?.hospital}</p>
                                 <p><strong className="text-gray-600">Fee:</strong> ₹{doctor?.consultationFee}</p>
                             </div>
                         </div>
                         <div>
                             <div className="flex items-center justify-between mb-4">
                                 <h2 className="font-semibold text-lg text-gray-900">My Weekly Availability</h2>
                                 {!isEditingAvailability ? (
                                     <button onClick={() => setIsEditingAvailability(true)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors">Edit Schedule</button>
                                 ) : (
                                     <div className="flex items-center space-x-2">
                                         {availabilityLoading && <MiniLoader />}
                                         <button onClick={handleCancelEditAvailability} disabled={availabilityLoading} className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
                                         <button onClick={handleSaveAvailability} disabled={availabilityLoading} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"><Save size={14} /><span>Save Changes</span></button>
                                     </div>
                                 )}
                             </div>
                             {availabilityError && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{availabilityError}</div>)}
                             <div className="space-y-4">
                                 {daysOfWeek.map((dayName, dayIndex) => {
                                     const daySchedule = availability.find(d => d.dayOfWeek === dayIndex);
                                     const slots = daySchedule?.slots || [];
                                     return (
                                         <div key={dayIndex} className="p-4 border rounded-lg bg-gray-50">
                                             <div className="flex items-center justify-between mb-2">
                                                 <h3 className="font-medium text-gray-800">{dayName}</h3>
                                                 {isEditingAvailability && (<button onClick={() => handleAddTimeSlot(dayIndex)} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 p-1 rounded-full" title={`Add slot to ${dayName}`}><Plus size={14} /></button>)}
                                             </div>
                                             {slots.length === 0 ? (<p className="text-sm text-gray-500 italic">{isEditingAvailability ? 'No slots added. Click + to add.' : 'Not available'}</p>) : (
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                     {slots.map((slot, slotIndex) => (
                                                         <div key={slotIndex} className="flex items-center space-x-2 bg-white p-2 border rounded">
                                                             {isEditingAvailability ? (<>
                                                                 <input type="time" value={slot.start} onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'start', e.target.value)} className="text-sm border rounded px-1 py-0.5 w-full focus:ring-1 focus:ring-green-300 focus:border-green-300 outline-none"/>
                                                                 <span className="text-gray-400">-</span>
                                                                 <input type="time" value={slot.end} onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'end', e.target.value)} className="text-sm border rounded px-1 py-0.5 w-full focus:ring-1 focus:ring-green-300 focus:border-green-300 outline-none"/>
                                                                 <button onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Remove slot"><Trash2 size={14} /></button>
                                                             </>) : (<span className="text-sm font-mono text-gray-700">{slot.start} - {slot.end}</span>)}
                                                         </div>
                                                     ))}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                )}

                {activeView === 'reviews' && (
                     <div className="bg-white rounded-2xl border border-gray-100 p-6">
                          <h2 className="font-semibold text-gray-900 mb-4">Patient Reviews</h2>
                          <div className="space-y-4">
                              {(doctor?.reviews || []).map((r, i) => (
                                  <div key={i} className="border rounded-xl p-3 bg-gray-50">
                                      <div className="flex items-center justify-between">
                                          <div className="font-semibold text-gray-900">{r.user?.fullName || 'Patient'}</div>
                                          <div className="text-yellow-500 flex items-center"><Star className="w-4 h-4 mr-1"/> {r.rating}</div>
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">{r.comment || <span className="italic">No comment left.</span>}</div>
                                  </div>
                              ))}
                              {(!doctor?.reviews || doctor.reviews.length === 0) && (
                                  <div className="text-sm text-gray-500 text-center py-4">No reviews yet.</div>
                              )}
                          </div>
                     </div>
                 )}

                 <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 flex items-center">
                            Pending Appointment Requests
                            {pendingAppointments.length > 0 && (
                                <span className="ml-2 bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingAppointments.length}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingAppointments.length === 0 ? (
                            <div className="text-gray-500 text-sm py-4 text-center">No pending requests.</div>
                        ) : (
                            pendingAppointments.map((appt) => (
                                <div key={appt._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <div className="font-semibold text-gray-900">{appt.user?.fullName || 'Patient'}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(appt.startTime).toLocaleDateString()}
                                            {' @ '}
                                            {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                        {actionLoading[appt._id] ? (
                                            <MiniLoader />
                                        ) : (
                                            <>
                                                <button onClick={() => handleAppointmentAction(appt._id, 'reject')} disabled={actionLoading[appt._id]} className="flex-1 sm:flex-none flex items-center justify-center space-x-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition disabled:opacity-50" title="Reject Request">
                                                    <X size={16} />
                                                    <span>Reject</span>
                                                </button>
                                                <button onClick={() => handleAppointmentAction(appt._id, 'confirm')} disabled={actionLoading[appt._id]} className="flex-1 sm:flex-none flex items-center justify-center space-x-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition disabled:opacity-50" title="Confirm Appointment">
                                                    <Check size={16} />
                                                    <span>Accept</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                 <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                     <div className="flex items-center justify-between mb-4">
                         <h2 className="font-semibold text-gray-900">Today's Scheduled Appointments</h2>
                         <button onClick={() => setActiveView('appointments')} className="text-sm text-green-600 hover:text-green-700 font-semibold">View All</button>
                     </div>
                     <div className="divide-y divide-gray-100">
                         {todaysAppointments.length === 0 ? (
                             <div className="text-gray-500 text-sm py-4 text-center">No appointments scheduled for today.</div>
                         ) : (
                             todaysAppointments.map((appt) => (
                                 <div key={appt._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                       <div className="mb-2 sm:mb-0">
                                          <div className="font-semibold text-gray-900">{appt.user?.fullName || 'Patient'}</div>
                                          <div className="text-sm text-gray-600">
                                              {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              {' - '}
                                              {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                           <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${appt.status === 'Ongoing' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>{appt.status}</span>
                                      </div>
                                     {(appt.status === 'Scheduled' || appt.status === 'Ongoing') && (
                                         <div className="flex items-center space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                             <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                                                 <Video size={16} />
                                                 <span>{appt.status === 'Ongoing' ? 'Join Call' : 'Start Call'}</span>
                                             </button>
                                             <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 border px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                                 <FileText size={16} />
                                                 <span>Prescription</span>
                                             </button>
                                         </div>
                                     )}
                                 </div>
                             ))
                         )}
                     </div>
                 </div>
            </main>
        </div>
    );
}

export default DoctorDashboard;

