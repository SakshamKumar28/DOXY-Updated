// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home.jsx'; 
import LoadingAnimation from './components/LoadingAnimation'; 
import SignupPage from './pages/SignupPage'; 
import UserDashBoard from './pages/UserDashBoard';
import LoginPage from './pages/LoginPage'; 
import RoleSelect from './pages/RoleSelect';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import ProtectedRoute from './components/ProtectedRoute';
import AuthWrapperForVideoCall from './components/AuthWrapperForVideoCall';
import BookAppointment from './pages/BookAppointment';
// Use a slightly more explicit relative path and rename the import variable
import VideoCallComponent from './pages/VideoCall.jsx'; // Renamed import variable [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/VideoCall.jsx]

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
    return <LoadingAnimation />; // [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/components/LoadingAnimation.jsx]
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} /> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/Home.jsx] */}
        <Route path='/role' element={<RoleSelect />} /> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/RoleSelect.jsx] */}
        <Route path='/user/register' element={<SignupPage/>}/> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/SignupPage.jsx] */}
        <Route path='/user/login' element={<LoginPage/>}/> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/LoginPage.jsx] */}
        <Route path='/dashboard' element={
          <ProtectedRoute userType="user"> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/components/ProtectedRoute.jsx] */}
            <UserDashBoard/> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/UserDashBoard.jsx] */}
          </ProtectedRoute>
        } />
        <Route path='/doctor/dashboard' element={
          <ProtectedRoute userType="doctor"> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/components/ProtectedRoute.jsx] */}
            <DoctorDashboard/> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/DoctorDashboard.jsx] */}
          </ProtectedRoute>
        } />
        <Route path='/doctor/login' element={<DoctorLogin/>} /> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/DoctorLogin.jsx] */}
        <Route path='/doctor/register' element={<DoctorRegister/>} /> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/DoctorRegister.jsx] */}
        <Route path='/book-appointment' element={
          <ProtectedRoute userType="user"> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/components/ProtectedRoute.jsx] */}
            <BookAppointment/> {/* [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/BookAppointment.jsx] */}
          </ProtectedRoute>
        } />
        {/* --- Updated Video Call Route --- */}
        <Route path='/video-call/:appointmentId' element={
          <AuthWrapperForVideoCall> {/* <-- Use the new wrapper [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/components/AuthWrapperForVideoCall.jsx] */}
            <VideoCallComponent /> {/* Use the renamed variable [cite: sakshamkumar28/doxy-updated/DOXY-Updated-8c70425d297c70555cebc4ea07776e3f9c255c0d/frontend/src/pages/VideoCall.jsx] */}
          </AuthWrapperForVideoCall>
        } />
        {/* ---------------------------------- */}
      </Routes>
    </>
  )
}

export default App;

