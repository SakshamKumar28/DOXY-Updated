import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const RoleSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const action = params.get('action') === 'login' ? 'login' : 'register';

  const handleSelect = (role) => {
    if (role === 'user') {
      navigate(action === 'login' ? '/user/login' : '/user/register');
    } else {
      navigate(action === 'login' ? '/doctor/login' : '/doctor/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Continue as</h1>
          <p className="text-gray-600">Choose your role to {action}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleSelect('user')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Patient / User
          </button>
          <button
            onClick={() => handleSelect('doctor')}
            className="w-full border-2 border-green-500 text-green-700 py-4 rounded-2xl font-semibold text-lg hover:bg-green-50 transition-all duration-200"
          >
            Doctor
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect


