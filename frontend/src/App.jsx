// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home.jsx'; //
import LoadingAnimation from './components/LoadingAnimation'; //
import SignupPage from './pages/SignupPage'; //
import UserDashBoard from './pages/UserDashBoard'; //
import LoginPage from './pages/LoginPage'; //
import RoleSelect from './pages/RoleSelect'; //
import DoctorDashboard from './pages/DoctorDashboard'; //
import DoctorLogin from './pages/DoctorLogin'; //
import DoctorRegister from './pages/DoctorRegister'; //
import ProtectedRoute from './components/ProtectedRoute'; //
import AuthWrapperForVideoCall from './components/AuthWrapperForVideoCall'; // <-- Import the new wrapper
import BookAppointment from './pages/BookAppointment'; //
import VideoCall from './pages/VideoCall'; //

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Reduced loading time slightly

    return () => {
      clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <LoadingAnimation />; //
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} /> {/* */}
        <Route path='/role' element={<RoleSelect />} /> {/* */}
        <Route path='/user/register' element={<SignupPage/>}/> {/* */}
        <Route path='/user/login' element={<LoginPage/>}/> {/* */}
        <Route path='/dashboard' element={
          <ProtectedRoute userType="user"> {/* */}
            <UserDashBoard/> {/* */}
          </ProtectedRoute>
        } />
        <Route path='/doctor/dashboard' element={
          <ProtectedRoute userType="doctor"> {/* */}
            <DoctorDashboard/> {/* */}
          </ProtectedRoute>
        } />
        <Route path='/doctor/login' element={<DoctorLogin/>} /> {/* */}
        <Route path='/doctor/register' element={<DoctorRegister/>} /> {/* */}
        <Route path='/book-appointment' element={
          <ProtectedRoute userType="user"> {/* */}
            <BookAppointment/> {/* */}
          </ProtectedRoute>
        } />
        {/* --- Updated Video Call Route --- */}
        <Route path='/video-call/:appointmentId' element={
          <AuthWrapperForVideoCall> {/* <-- Use the new wrapper */}
            <VideoCall/> {/* */}
          </AuthWrapperForVideoCall>
        } />
        {/* ---------------------------------- */}
      </Routes>
    </>
  )
}

export default App;