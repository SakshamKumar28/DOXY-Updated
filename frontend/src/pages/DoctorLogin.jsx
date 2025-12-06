import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!email || !password) { setApiError('Email and password are required'); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      navigate('/doctor/dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Sign In</h1>
          <p className="text-gray-600">Access your dashboard</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none border-gray-200 focus:border-green-500" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 rounded-2xl outline-none border-gray-200 focus:border-green-500" placeholder="Your password" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">New to DOXY? <button onClick={() => navigate('/doctor/register')} className="text-green-600 font-semibold">Create account</button></p>
        </div>
      </div>
    </div>
  )
}

export default DoctorLogin


