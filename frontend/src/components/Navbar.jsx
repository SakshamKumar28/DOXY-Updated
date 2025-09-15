import React, { useState } from 'react'
import { Button } from './ui/button'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <nav className='w-full h-[9vh] flex justify-between items-center px-2.5 relative'>
        <div className="left font-[Poppins] font-bold">
          DOXY
        </div>
        
        {/* Desktop Menu */}
        <div className="middle ml-[4.5vw] hidden md:block">
          <ul className='flex items-center gap-[2vw] decoration-0'>
            <li>
              <a href="#" className="relative py-2 transition-all duration-300 hover:text-blue-600 group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <a href="#" className="relative py-2 transition-all duration-300 hover:text-blue-600 group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li>
              <a href="#" className="relative py-2 transition-all duration-300 hover:text-blue-600 group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
          </ul>
        </div>
        
        {/* Desktop Buttons */}
        <div className="right hidden md:flex gap-2">
          <Button>Register</Button>
          <Button>Login</Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-all duration-300"
          aria-label="Toggle menu"
        >
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-[9vh] left-0 w-full bg-white shadow-lg z-50 border-t overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className={`flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          {/* Mobile Navigation Links */}
          <ul className='flex flex-col gap-4 mb-6'>
            <li className={`transform transition-all duration-300 delay-75 ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}>
              <a 
                href="#" 
                className="block py-2 text-lg relative transition-all duration-300 hover:text-blue-600 hover:translate-x-2 group"
                onClick={() => setIsOpen(false)}
              >
                Home
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li className={`transform transition-all duration-300 delay-100 ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}>
              <a 
                href="#" 
                className="block py-2 text-lg relative transition-all duration-300 hover:text-blue-600 hover:translate-x-2 group"
                onClick={() => setIsOpen(false)}
              >
                About
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
            <li className={`transform transition-all duration-300 delay-150 ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}>
              <a 
                href="#" 
                className="block py-2 text-lg relative transition-all duration-300 hover:text-blue-600 hover:translate-x-2 group"
                onClick={() => setIsOpen(false)}
              >
                Services
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </li>
          </ul>
          
          {/* Mobile Buttons */}
          <div className="flex flex-col gap-3">
            <Button className={`w-full transform transition-all duration-300 delay-200 ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              Register
            </Button>
            <Button className={`w-full transform transition-all duration-300 delay-250 ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar