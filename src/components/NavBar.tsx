import { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Hide on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-hide after 3s on mouse leave
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 3000);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleLoginToggle = () => {
    setIsLoggedIn(prev => !prev);
    setShowDropdown(false);
  };

  const handleConfigure = () => {
    setShowDropdown(false);
  };

  return (
    <nav className='w-full text-green-900 bg-green-500 bg-opacity-50 backdrop-blur-md  px-6 py-3 flex justify-between items-center shadow-md'>
      <div className='w-1/3'></div>

      <h1 className='text-xl font-bold text-center w-1/3'>Nature Theme Vision Therapy</h1>

      <div className='w-1/3 flex justify-end relative' ref={dropdownRef}>
        <button onClick={() => setShowDropdown(prev => !prev)}>
          <FaUserCircle className='text-3xl cursor-pointer' />
        </button>

        {showDropdown && (
          <div
            className='absolute right-0 mt-[2.5rem] bg-white text-black rounded shadow-lg z-10 w-40'
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          >
            <button className='block px-4 py-2 hover:bg-gray-100 w-full text-left' onClick={handleLoginToggle}>
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>
            <button className='block px-4 py-2 hover:bg-gray-100 w-full text-left' onClick={handleConfigure}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
