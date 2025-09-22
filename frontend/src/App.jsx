import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import LoadingAnimation from './components/LoadingAnimation'
import SignupPage from './pages/SignUpPage'
import UserDashBoard from './pages/UserDashBoard'

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

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
        <Route path='/user/register' element={<SignupPage/>}/>
        <Route path='/dashboard' element={<UserDashBoard/>} />
      </Routes>
    </>
  )
}

export default App