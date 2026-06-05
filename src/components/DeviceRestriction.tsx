import React, { useState, useEffect } from 'react';
import { FaLaptop, FaTabletAlt, FaMobileAlt } from 'react-icons/fa';

interface DeviceRestrictionProps {
  children: React.ReactNode;
}

const DeviceRestriction: React.FC<DeviceRestrictionProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-emerald-100 max-w-md mx-auto my-12 animate-in fade-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full scale-150 blur-xl opacity-50" />
          <div className="relative flex items-center gap-4 text-4xl">
            <FaLaptop className="text-emerald-600" />
            <FaTabletAlt className="text-emerald-500" />
            <span className="text-gray-300">|</span>
            <FaMobileAlt className="text-red-400 scale-75" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-green-900 mb-4 tracking-tight">
          Larger Screen Required
        </h2>
        
        <p className="text-green-800/80 mb-6 leading-relaxed font-medium">
          To ensure the vision therapy is effective and to meet the required clinical goals, these activities must be played on a <strong>Tablet, Laptop, or Desktop</strong>.
        </p>
        
        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-800 text-sm font-semibold border border-emerald-100">
          Mobile screens are too small for proper binocular fusion training.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DeviceRestriction;
