import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home.jsx'
import LoadingAnimation from './components/LoadingAnimation'

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
      </Routes>
    </>
  )
}

export default App