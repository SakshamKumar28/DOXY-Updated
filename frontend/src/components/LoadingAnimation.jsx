import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Main animation container */}
      <div className="relative flex items-center justify-center mb-8">
        
        {/* Outer rotating ring */}
        <div className="absolute w-32 h-32 border-2 border-transparent border-t-green-500 border-r-green-300 rounded-full animate-spin"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute w-24 h-24 border-2 border-green-200 rounded-full animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
          {/* Letter D */}
          <div className="text-white text-2xl font-bold">D</div>
          
          {/* Medical cross overlay - small and subtle */}
          <div className="absolute top-2 right-2 w-2 h-2">
            <div className="absolute w-2 h-0.5 bg-white rounded-full"></div>
            <div className="absolute w-0.5 h-2 bg-white rounded-full left-0.5"></div>
          </div>
        </div>
        
        {/* Floating medical icons */}
        <div className="absolute w-6 h-6 -top-8 -right-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.5s'}}>
          <div className="w-3 h-3">
            <div className="absolute w-3 h-0.5 bg-green-600 rounded-full top-1.5"></div>
            <div className="absolute w-0.5 h-3 bg-green-600 rounded-full left-1.5"></div>
          </div>
        </div>
        
        <div className="absolute w-5 h-5 -bottom-6 -left-6 bg-green-50 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '1s'}}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="absolute w-4 h-4 top-8 -left-8 bg-green-200 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}>
        </div>
      </div>
      
      {/* Loading dots */}
      <div className="flex space-x-2 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
      </div>
      
      {/* Connecting text */}
      <p className="text-gray-600 text-base font-medium mb-4 animate-pulse">
        Connecting to healthcare
      </p>
      
      {/* Modern progress bar */}
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-loading-bar"></div>
      </div>
      
      {/* Floating stethoscope-inspired elements */}
      <div className="absolute top-1/4 left-1/4">
        <div className="w-8 h-8 border-2 border-green-200 rounded-full animate-float" style={{animationDelay: '0s'}}>
          <div className="w-2 h-2 bg-green-300 rounded-full m-2"></div>
        </div>
      </div>
      
      <div className="absolute top-1/3 right-1/4">
        <div className="w-6 h-6 border-2 border-green-100 rounded-full animate-float" style={{animationDelay: '2s'}}>
          <div className="w-1 h-1 bg-green-200 rounded-full m-2"></div>
        </div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/3">
        <div className="w-4 h-4 bg-green-50 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <style >{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-15px) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;