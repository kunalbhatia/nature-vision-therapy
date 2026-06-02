import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCog, FaHome, FaBook, FaHeartbeat, FaChartLine } from 'react-icons/fa';

type NavBarType = {
  onLogin?: () => void;
  onLogout?: () => void;
  onConfigure?: () => void;
  onSignup?: () => void;
  isLoggedIn: boolean;
};

const Navbar = ({ onLogin, onLogout, onConfigure, onSignup, isLoggedIn }: NavBarType) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (typeof onLogin === 'function' && !isLoggedIn) onLogin();
    if (typeof onLogout === 'function' && isLoggedIn) onLogout();
    setShowDropdown(false);
  };

  const handleSignup = () => {
    if (typeof onSignup === 'function') {
      onSignup();
    }
    setShowDropdown(false);
  };

  const handleConfigure = () => {
    if (typeof onConfigure === 'function') {
      onConfigure();
    }
    setShowDropdown(false);
  };

  return (
    <nav className='w-full text-green-900 bg-green-500 bg-opacity-50 backdrop-blur-md px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50'>
      <div className='flex items-center gap-4 w-1/3'>
        <Link to="/" className='flex items-center gap-2 font-semibold text-green-900 hover:text-green-950 transition-colors'>
          <FaHome />
          <span className='hidden md:inline'>Home</span>
        </Link>
        <Link to="/stories" className='flex items-center gap-2 font-semibold text-green-900 hover:text-green-950 transition-colors'>
          <FaBook />
          <span className='hidden md:inline'>Stories</span>
        </Link>
        <Link to="/therapy" className='flex items-center gap-2 font-semibold text-green-900 hover:text-green-950 transition-colors'>
          <FaHeartbeat />
          <span className='hidden md:inline'>Therapy</span>
        </Link>
        <Link to="/dashboard" className='flex items-center gap-2 font-semibold text-green-900 hover:text-green-950 transition-colors'>
          <FaChartLine />
          <span className='hidden md:inline'>Dashboard</span>
        </Link>
      </div>

      <h1 className='text-xl font-bold text-center w-1/3 truncate'>Nature Therapy</h1>

      <div className='w-1/3 flex justify-end relative' ref={dropdownRef}>
        <button onClick={() => setShowDropdown(prev => !prev)} className='focus:outline-none'>
          <FaUserCircle className='text-3xl cursor-pointer hover:text-green-950 transition-colors' />
        </button>

        {showDropdown && (
          <div
            className='absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50 w-48 py-2 border border-gray-100'
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          >
            {isLoggedIn && (
              <>
                <Link
                  to="/settings"
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left'
                  onClick={() => setShowDropdown(false)}
                >
                  <FaCog />
                  Settings
                </Link>
                <button
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left'
                  onClick={handleConfigure}
                >
                  <FaCog />
                  Personalize
                </button>
              </>
            )}
            <button
              className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left border-t border-gray-100'
              onClick={handleLoginToggle}
            >
              {isLoggedIn ? <FaSignOutAlt /> : <FaSignInAlt />}
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>

            {!isLoggedIn && (
              <button
                className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left'
                onClick={handleSignup}
              >
                <FaUserPlus />
                Sign Up
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

