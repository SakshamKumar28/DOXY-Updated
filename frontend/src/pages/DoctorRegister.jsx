import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Building2, Stethoscope, IndianRupee, Shield, Lock, AlertCircle } from 'lucide-react'

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    age: '',
    specialisation: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    password: '',
    confirmPassword: ''
  });

  const specialisations = [
    'Cardiologist','Dermatologist','Endocrinologist','Gastroenterologist','Hematologist','Neurologist','Oncologist','Pediatrician','Psychiatrist','Rheumatologist','Urologist'
  ];

  const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3000/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) newErrors.phoneNumber = 'Enter 10-digit phone';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (Number(formData.age) < 20) newErrors.age = 'Age must be at least 20';
    if (!formData.specialisation) newErrors.specialisation = 'Specialisation is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    else if (Number(formData.experience) < 1) newErrors.experience = 'Must be at least 1 year';
    if (!formData.hospital.trim()) newErrors.hospital = 'Hospital is required';
    if (formData.consultationFee === '') newErrors.consultationFee = 'Consultation fee is required';
    else if (Number(formData.consultationFee) < 0) newErrors.consultationFee = 'Fee cannot be negative';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const payload = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.replace(/\s+/g, ''),
        age: Number(formData.age),
        specialisation: formData.specialisation,
        experience: Number(formData.experience),
        hospital: formData.hospital.trim(),
        consultationFee: Number(formData.consultationFee),
        password: formData.password
      };
      const res = await fetch(`${API_BASE_URL}/auth/doctor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      alert('Doctor account created. Please sign in.');
      navigate('/doctor/login');
    } catch (err) {
      setApiError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Sign Up</h1>
          <p className="text-gray-600">Create your professional profile</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="fullname" value={formData.fullname} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.fullname ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" />
            </div>
            {errors.fullname && <p className="text-sm text-red-600 mt-1">{errors.fullname}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.phoneNumber ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit number" />
            </div>
            {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.age ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="e.g. 30" />
            </div>
            {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specialisation</label>
            <div className="relative">
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select name="specialisation" value={formData.specialisation} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none bg-white ${errors.specialisation ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`}>
                <option value="">Select specialisation</option>
                {specialisations.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            {errors.specialisation && <p className="text-sm text-red-600 mt-1">{errors.specialisation}</p>}
          </div>

          <div>
            <label className="block text_sm font-semibold text-gray-700 mb-2">Experience (years)</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.experience ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="e.g. 5" />
            </div>
            {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="hospital" value={formData.hospital} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.hospital ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="Affiliated hospital" />
            </div>
            {errors.hospital && <p className="text-sm text-red-600 mt-1">{errors.hospital}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.consultationFee ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="e.g. 500" />
            </div>
            {errors.consultationFee && <p className="text-sm text-red-600 mt-1">{errors.consultationFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="Min 8 characters" />
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-green-500'}`} placeholder="Re-enter password" />
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">Already have an account? <button onClick={() => navigate('/doctor/login')} className="text-green-600 font-semibold">Sign In</button></p>
        </div>
      </div>
    </div>
  )
}

export default DoctorRegister


