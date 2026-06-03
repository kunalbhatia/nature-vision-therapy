import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaCog, FaHome, FaBook, FaHeartbeat, FaChartLine, FaBars } from 'react-icons/fa';

type NavBarType = {
  onLogout?: () => void;
  isLoggedIn: boolean;
};

const Navbar = ({ onLogout, isLoggedIn }: NavBarType) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  return (
    <nav className={`h-screen sticky top-0 bg-green-950/90 backdrop-blur-md border-r border-green-800 text-white flex flex-col justify-between p-3 transition-all duration-300 z-50 ${isExpanded ? 'w-64' : 'w-16'}`}>
      
      {/* Top Header & Toggle */}
      <div className="flex flex-col gap-6">
        <div className={`flex items-center ${isExpanded ? 'justify-between animate-in fade-in duration-300' : 'justify-center'} px-2 py-1`}>
          {isExpanded && (
            <span className="text-lg font-black text-emerald-400 tracking-wide select-none truncate">
              Nature Therapy
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(prev => !prev)} 
            className="p-2 rounded-lg hover:bg-green-900/50 text-emerald-400 hover:text-white transition-colors"
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <FaBars className="text-xl" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              location.pathname === '/' 
                ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                : 'text-green-100 hover:bg-green-900/50 hover:text-white'
            } ${!isExpanded && 'justify-center'}`}
            title="Home"
          >
            <FaHome className="text-xl shrink-0" />
            {isExpanded && <span className="text-sm font-semibold">Home</span>}
          </Link>

          <Link
            to="/stories"
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              location.pathname.startsWith('/stories')
                ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                : 'text-green-100 hover:bg-green-900/50 hover:text-white'
            } ${!isExpanded && 'justify-center'}`}
            title="Stories"
          >
            <FaBook className="text-xl shrink-0" />
            {isExpanded && <span className="text-sm font-semibold">Stories</span>}
          </Link>

          <Link
            to="/therapy"
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              location.pathname.startsWith('/therapy')
                ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                : 'text-green-100 hover:bg-green-900/50 hover:text-white'
            } ${!isExpanded && 'justify-center'}`}
            title="Therapy"
          >
            <FaHeartbeat className="text-xl shrink-0" />
            {isExpanded && <span className="text-sm font-semibold">Therapy</span>}
          </Link>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                location.pathname.startsWith('/dashboard')
                  ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                  : 'text-green-100 hover:bg-green-900/50 hover:text-white'
              } ${!isExpanded && 'justify-center'}`}
              title="Dashboard"
            >
              <FaChartLine className="text-xl shrink-0" />
              {isExpanded && <span className="text-sm font-semibold">Dashboard</span>}
            </Link>
          )}

          {isLoggedIn && (
            <Link
              to="/personalize"
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                location.pathname === '/personalize'
                  ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                  : 'text-green-100 hover:bg-green-900/50 hover:text-white'
              } ${!isExpanded && 'justify-center'}`}
              title="Personalize"
            >
              <FaCog className="text-xl shrink-0" />
              {isExpanded && <span className="text-sm font-semibold">Personalize</span>}
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Profile / Logout */}
      {isLoggedIn && (
        <button
          onClick={onLogout}
          className={`flex items-center gap-4 p-3 rounded-xl hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all text-left ${!isExpanded && 'justify-center'}`}
          title="Logout"
        >
          <FaSignOutAlt className="text-2xl shrink-0" />
          {isExpanded && <span className="text-sm font-semibold">Logout</span>}
        </button>
      )}
    </nav>
  );
};

export default Navbar;

