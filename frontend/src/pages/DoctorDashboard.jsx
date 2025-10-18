import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, Video, FileText, User, Star, LogOut, Clock, IndianRupee, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const api = axios.create({
	baseURL: 'http://localhost:3000/api',
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' }
});

const DoctorDashboard = () => {
	const [doctor, setDoctor] = useState(null);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				// Placeholder: wire up to real endpoints when available
				const doctorRes = await api.get('/auth/doctor/me');
				if (!doctorRes.data?.data) {
					throw new Error('No doctor data received');
				}
				setDoctor(doctorRes.data.data);	
				const appointmentsRes = await api.get('/auth/doctor/appointments');
				if (!appointmentsRes.data?.data) {
					throw new Error('No appointments data received');
				}
				setAppointments(appointmentsRes.data.data);
				setAppointments([]);
				setError('');
			} catch (e) {
				setError('Failed to load dashboard');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleLogout = async () => {
		try { await api.post('/auth/user/logout'); navigate('/'); } catch (e) { /* no-op */ }
	};

	if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
	if (error) return <div className="h-screen flex items-center justify-center text-red-600">{error}</div>;

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center space-x-2">
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
					<div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16"></div>
					<div className="relative z-10">
						<h1 className="text-2xl md:text-3xl font-bold">Welcome, {doctor?.fullname || 'Doctor'}</h1>
						<p className="text-green-100">Here's your practice overview</p>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
							<div className="bg-white/10 rounded-2xl p-3">
								<div className="text-xs text-green-100">Today</div>
								<div className="text-xl font-bold flex items-center"><Clock className="w-4 h-4 mr-1"/> {appointments.length || 0}</div>
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
					<div className="bg-white rounded-2xl border border-gray-100 p-6">
						<div className="flex items-center space-x-3 mb-4">
							<User className="text-green-600" />
							<h2 className="font-semibold text-gray-900">Profile</h2>
						</div>
						<p className="text-sm text-gray-600">Manage availability, fees, and profile information.</p>
					</div>
					<div className="bg-white rounded-2xl border border-gray-100 p-6">
						<div className="flex items-center space-x-3 mb-4">
							<Calendar className="text-green-600" />
							<h2 className="font-semibold text-gray-900">Appointments</h2>
						</div>
						<p className="text-sm text-gray-600">View and start upcoming video calls.</p>
					</div>
					<div className="bg-white rounded-2xl border border-gray-100 p-6">
						<div className="flex items-center space-x-3 mb-4">
							<Star className="text-green-600" />
							<h2 className="font-semibold text-gray-900">Reviews</h2>
						</div>
						<p className="text-sm text-gray-600">See patient feedback and ratings.</p>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div className="bg-white rounded-2xl border border-gray-100 p-6 md:col-span-2">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-gray-900">Today's Appointments</h2>
						</div>
						<div className="divide-y divide-gray-100">
							{appointments.length === 0 && (
								<div className="text-gray-500 text-sm">No appointments scheduled.</div>
							)}
							{appointments.map((appt) => (
								<div key={appt._id} className="py-4 flex items-center justify-between">
									<div>
										<div className="font-semibold text-gray-900">{appt.user?.fullName || 'Patient'}</div>
										<div className="text-sm text-gray-600">{new Date(appt.startTime).toLocaleTimeString()} - {new Date(appt.endTime).toLocaleTimeString()}</div>
									</div>
									<div className="flex items-center space-x-2">
										<button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm">
											<Video size={16} />
											<span>Start Call</span>
										</button>
										<button className="flex items-center space-x-2 border px-3 py-2 rounded-lg text-sm">
											<FileText size={16} />
											<span>Prescription</span>
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="bg-white rounded-2xl border border-gray-100 p-6">
						<h2 className="font-semibold text-gray-900 mb-4">Recent Reviews</h2>
						<div className="space-y-4">
							{(doctor?.reviews || []).slice(0,3).map((r, i) => (
								<div key={i} className="border rounded-xl p-3">
									<div className="flex items-center justify-between">
										<div className="font-semibold text-gray-900">{r.user?.fullName || 'Patient'}</div>
										<div className="text-yellow-500 flex items-center"><Star className="w-4 h-4 mr-1"/> {r.rating}</div>
									</div>
									<div className="text-sm text-gray-600 mt-1">{r.comment}</div>
								</div>
							))}
							{(!doctor?.reviews || doctor.reviews.length === 0) && (
								<div className="text-sm text-gray-500">No reviews yet.</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default DoctorDashboard


