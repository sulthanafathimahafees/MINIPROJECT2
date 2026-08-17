import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, UserCheck, LogOut, Sun, Moon, LayoutDashboard, Shield, User, Briefcase } from 'lucide-react';
import Logo from './Logo';
import { getStoredUser, logoutUser } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/login');
  };

  const userRole = (user?.role || 'customer').toLowerCase();

  // Dynamic role-dependent navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    ...(user ? [
      { 
        label: userRole === 'admin' ? 'Admin Dashboard' : (userRole === 'salesperson' || userRole === 'sales') ? 'Sales Dashboard' : 'Dashboard', 
        path: userRole === 'admin' ? '/admin-dashboard' : (userRole === 'salesperson' || userRole === 'sales') ? '/sales-dashboard' : '/customer-dashboard' 
      }
    ] : []),
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-nav shadow-md py-3' 
        : 'bg-transparent py-4'
    }`}>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border">
        <div className="flex items-center justify-between w-full h-16 sm:h-18">
          
          {/* LEFT SECTION: OptiBuy Logo */}
          <div className="flex-1 flex items-center justify-start shrink-0">
            <Logo showTagline={!isScrolled} />
          </div>

          {/* CENTER SECTION: Clean Single Rounded Navigation Pill Capsule */}
          <div className="flex-none hidden md:flex items-center justify-center">
            <nav className="inline-flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/90 shadow-sm whitespace-nowrap">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-6 sm:px-7 lg:px-8 py-2.5 sm:py-3 rounded-full text-[15px] sm:text-[16px] lg:text-[17px] font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                        : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* RIGHT SECTION: Action Controls (Theme Toggle, Login, Get Started) */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-[18px] shrink-0">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-xs transition-all duration-200 shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to={userRole === 'admin' ? '/admin-dashboard' : (userRole === 'salesperson' || userRole === 'sales') ? '/sales-dashboard' : '/customer-dashboard'}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-sm font-bold shadow-xs hover:border-emerald-400 transition-all"
                >
                  <UserCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{user.fullName || user.email}</span>
                  <span className="ml-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-extrabold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                    {userRole}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition-all duration-200 shadow-xs"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-[15px] font-semibold text-slate-800 dark:text-slate-100 hover:text-[#2563EB] dark:hover:text-cyan-400 transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[15px] font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-md shadow-[#2563EB]/25 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions & Menu Trigger */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card mx-4 mt-2 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <div className="flex flex-col gap-2.5">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center py-3.5 rounded-xl text-base font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout ({user.fullName || user.email})</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full text-center py-3.5 rounded-xl text-base font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3.5 rounded-xl text-base font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
