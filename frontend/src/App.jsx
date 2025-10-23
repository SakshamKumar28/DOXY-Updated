// frontend/src/App.jsx
import React, { useEffect, useState } from 'react'; // Removed lazy, Suspense
import { Routes, Route } from 'react-router-dom';

// Standardize all imports to use the '@/' alias
import Home from '@/pages/Home.jsx';
import LoadingAnimation from '@/components/LoadingAnimation'; // Changed path
import SignupPage from '@/pages/SignupPage'; // Changed path
import UserDashBoard from '@/pages/UserDashBoard'; // Changed path
import LoginPage from '@/pages/LoginPage'; // Changed path
import RoleSelect from '@/pages/RoleSelect'; // Changed path
import DoctorDashboard from '@/pages/DoctorDashboard'; // Changed path
import DoctorLogin from '@/pages/DoctorLogin'; // Changed path
import DoctorRegister from '@/pages/DoctorRegister'; // Changed path
import ProtectedRoute from '@/components/ProtectedRoute'; // Changed path
import AuthWrapperForVideoCall from '@/components/AuthWrapperForVideoCall'; // Changed path
import BookAppointment from '@/pages/BookAppointment'; // Changed path

// Revert to direct import - ensure VideoCall.jsx uses NAMED export as before
import { VideoCallComponent } from '@/pages/VideoCall.jsx'; // Changed path and kept named import

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/role' element={<RoleSelect />} />
        <Route path='/user/register' element={<SignupPage/>}/>
        <Route path='/user/login' element={<LoginPage/>}/>
        <Route path='/dashboard' element={
          <ProtectedRoute userType="user">
            <UserDashBoard/>
          </ProtectedRoute>
        } />
        <Route path='/doctor/dashboard' element={
          <ProtectedRoute userType="doctor">
            <DoctorDashboard/>
          </ProtectedRoute>
        } />
        <Route path='/doctor/login' element={<DoctorLogin/>} />
        <Route path='/doctor/register' element={<DoctorRegister/>} />
        <Route path='/book-appointment' element={
          <ProtectedRoute userType="user">
            <BookAppointment/>
          </ProtectedRoute>
        } />
        {/* --- Reverted Video Call Route --- */}
        <Route path='/video-call/:appointmentId' element={
    <AuthWrapperForVideoCall
      render={({ authenticatedUser, userRole }) => ( // Pass render function
        <VideoCallComponent
          authenticatedUser={authenticatedUser}
          userRole={userRole}
        />
      )}
    />
  } />
        {/* ---------------------------------- */}
      </Routes>
    </>
  )
}

export default App;

