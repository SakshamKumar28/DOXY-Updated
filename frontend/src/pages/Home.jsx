import React, { useState, useEffect } from 'react';
import { Search, Phone, Video, Calendar, Star, Menu, X, ChevronRight, Shield, Clock, Users, Bot, FileText, Stethoscope, Heart, MessageCircle, CheckCircle } from 'lucide-react';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "24/7 AI Symptoms Checker",
      description: "Get instant health insights with our advanced AI-powered symptom analyzer",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Consultancy",
      description: "Face-to-face consultations with certified doctors from anywhere",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Digital Prescriptions",
      description: "Receive and manage your prescriptions digitally with secure delivery",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Instant Appointments",
      description: "Book appointments instantly or schedule for later - no waiting",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Patients", icon: <Users className="w-6 h-6" /> },
    { number: "1000+", label: "Expert Doctors", icon: <Stethoscope className="w-6 h-6" /> },
    { number: "24/7", label: "Available Support", icon: <Clock className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white text-xl font-bold">D</span>
                <div className="absolute w-2 h-2 ml-6 mt-6">
                  <div className="absolute w-2 h-0.5 bg-green-500 rounded-full"></div>
                  <div className="absolute w-0.5 h-2 bg-green-500 rounded-full left-0.5"></div>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">DOXY</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-green-600 font-semibold relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 transform scale-x-100 transition-transform"></span>
              </a>
              <a href="#services" className="text-gray-600 hover:text-green-600 relative group transition-colors">
                Services
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </a>
              <a href="#doctors" className="text-gray-600 hover:text-green-600 relative group transition-colors">
                Doctors
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </a>
              <a href="#about" className="text-gray-600 hover:text-green-600 relative group transition-colors">
                About
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              </a>
            </nav>

            <div className="hidden md:flex space-x-4">
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">Sign In</button>
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden transform hover:scale-110 active:scale-95 transition-all duration-150 ease-out p-2 rounded-lg hover:bg-gray-100 relative z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-1'
                }`} />
                <span className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ease-in-out translate-y-2.5 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`absolute block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? '-rotate-45 translate-y-2.5' : 'translate-y-4'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-md animate-fade-in" 
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-t shadow-2xl animate-slide-down">
              <div className="px-6 py-8 space-y-6">
                <a 
                  href="#home" 
                  className="group block text-green-600 font-semibold text-lg hover:text-green-700 transition-all duration-300 transform hover:translate-x-2 relative py-2 px-4 rounded-xl hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full transform scale-y-100 transition-transform duration-300"></div>
                </a>
                <a 
                  href="#services" 
                  className="group block text-gray-700 hover:text-green-600 text-lg transition-all duration-300 transform hover:translate-x-2 relative py-2 px-4 rounded-xl hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Services</span>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                </a>
                <a 
                  href="#doctors" 
                  className="group block text-gray-700 hover:text-green-600 text-lg transition-all duration-300 transform hover:translate-x-2 relative py-2 px-4 rounded-xl hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Doctors</span>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                </a>
                <a 
                  href="#about" 
                  className="group block text-gray-700 hover:text-green-600 text-lg transition-all duration-300 transform hover:translate-x-2 relative py-2 px-4 rounded-xl hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">About</span>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                </a>
                <div className="pt-6 space-y-4 border-t border-gray-200">
                  <button 
                    className="block w-full bg-white border-2 border-green-500 text-green-600 px-6 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </button>
                  <button 
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-100/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-green-200/40 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6 animate-fade-in-up">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                  <span className="text-gray-900">Your Health,</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient">
                    Our Priority
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                  Experience the future of healthcare with AI-powered diagnostics, 
                  instant video consultations, and digital prescriptions - all in one platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-delayed">
                <button className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-lg font-semibold">
                  <Bot className="mr-3 group-hover:animate-pulse" size={24} />
                  Try AI Symptom Checker
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button className="group border-2 border-green-500 text-green-600 px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 flex items-center justify-center text-lg font-semibold">
                  <Video className="mr-3" size={24} />
                  Book Video Call
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 animate-fade-in-up-delayed">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="flex justify-center mb-2 text-green-600 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="relative z-10">
                {/* Main Phone Mockup */}
                <div className="bg-white rounded-[3rem] p-4 shadow-2xl transform hover:rotate-1 transition-transform duration-500 mx-auto max-w-sm">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="text-white" size={24} />
                          </div>
                          <div>
                            <p className="font-semibold">AI Health Assistant</p>
                            <p className="text-green-100 text-sm">Online now</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-2xl p-4">
                          <p className="text-sm mb-2">How are you feeling today?</p>
                          <div className="flex space-x-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Headache</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Fever</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 rounded-2xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle size={16} />
                            <span className="text-sm">Analysis Complete</span>
                          </div>
                          <p className="text-xs text-green-100">Recommended: Video consultation with Dr. Smith</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-4 animate-float">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Video Call Ready</p>
                      <p className="text-xs text-gray-500">Dr. available now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-float-delayed">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Prescription Ready</p>
                      <p className="text-xs text-gray-500">Delivered digitally</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white relative" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed for the modern world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent transform hover:-translate-y-2 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 ${service.textColor} group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="mt-6">
                    <ChevronRight className={`${service.textColor} transform group-hover:translate-x-2 transition-transform duration-300`} size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-5xl font-bold text-white">
              Ready to Transform Your Healthcare?
            </h2>
            <p className="text-xl text-green-100">
              Join thousands who trust DOXY for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold text-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-green-600 transition-all duration-300 font-semibold text-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">D</span>
                </div>
                <span className="text-2xl font-bold">DOXY</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing healthcare with AI-powered solutions and seamless digital experiences.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">AI Symptom Checker</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Video Consultations</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Digital Prescriptions</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Health Records</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>24/7 Live Chat</li>
                <li>Emergency: 911</li>
                <li>support@doxy.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DOXY. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      <style >{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-fade-in-up-delayed {
          animation: fade-in-up 1s ease-out 0.3s both;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out 0.5s both;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;