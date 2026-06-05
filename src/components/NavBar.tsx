import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaCog, FaHome, FaBook, FaHeartbeat, FaChartLine, FaBars, FaTimes, FaEllipsisV } from 'react-icons/fa';

type NavBarType = {
  onLogout?: () => void;
  isLoggedIn: boolean;
};

const Navbar = ({ onLogout, isLoggedIn }: NavBarType) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', icon: <FaHome />, label: 'Home', exact: true },
    { to: '/stories', icon: <FaBook />, label: 'Stories' },
    { to: '/therapy', icon: <FaHeartbeat />, label: 'Therapy' },
    { to: '/dashboard', icon: <FaChartLine />, label: 'Dashboard', authRequired: true },
    { to: '/personalize', icon: <FaCog />, label: 'Personalize', authRequired: true },
  ];

  const filteredLinks = navLinks.filter(link => !link.authRequired || isLoggedIn);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-green-950/95 backdrop-blur-md border-b border-green-800 text-white flex items-center justify-between px-4 z-[60]">
        <span className="text-lg font-black text-emerald-400 tracking-wide select-none">
          Nature Therapy
        </span>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-green-900/50 text-emerald-400"
        >
          <FaEllipsisV className="text-xl" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop + Mobile Drawer) */}
      <nav className={`
        fixed md:sticky top-0 left-0 h-screen bg-green-950/95 backdrop-blur-md border-r border-green-800 text-white 
        flex flex-col justify-between p-3 transition-all duration-300 z-[80]
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isExpanded ? 'md:w-64' : 'md:w-16'}
      `}>
        
        {/* Header & Toggle */}
        <div className="flex flex-col gap-6">
          <div className={`flex items-center px-2 py-1 ${isExpanded || isMobileOpen ? 'justify-between' : 'justify-center'}`}>
            {(isExpanded || isMobileOpen) && (
              <span className="text-lg font-black text-emerald-400 tracking-wide select-none truncate">
                Nature Therapy
              </span>
            )}
            
            {/* Desktop Toggle */}
            <button 
              onClick={() => setIsExpanded(prev => !prev)} 
              className="hidden md:flex p-2 rounded-lg hover:bg-green-900/50 text-emerald-400 hover:text-white transition-colors"
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <FaBars className="text-xl" />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="md:hidden p-2 rounded-lg hover:bg-green-900/50 text-emerald-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2">
            {filteredLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  (link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to))
                    ? 'bg-emerald-500 text-green-950 font-bold shadow-md shadow-emerald-500/20' 
                    : 'text-green-100 hover:bg-green-900/50 hover:text-white'
                } ${(!isExpanded && !isMobileOpen) && 'md:justify-center'}`}
                title={link.label}
              >
                <span className="text-xl shrink-0">{link.icon}</span>
                {(isExpanded || isMobileOpen) && <span className="text-sm font-semibold">{link.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Profile / Logout */}
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-4 p-3 rounded-xl hover:bg-red-900/20 text-red-400 hover:text-red-300 transition-all text-left ${(!isExpanded && !isMobileOpen) && 'md:justify-center'}`}
            title="Logout"
          >
            <FaSignOutAlt className="text-2xl shrink-0" />
            {(isExpanded || isMobileOpen) && <span className="text-sm font-semibold">Logout</span>}
          </button>
        )}
      </nav>
    </>
  );
};

export default Navbar;

