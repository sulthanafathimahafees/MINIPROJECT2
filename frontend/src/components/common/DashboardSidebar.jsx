import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal, 
  ShieldCheck, 
  Heart, 
  User, 
  LogOut, 
  Users, 
  UserCheck, 
  Package, 
  BarChart3, 
  X,
  Lock
} from 'lucide-react';
import Logo from './Logo';
import { logoutUser } from '../../services/authService';

const DashboardSidebar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const normalizedRole = (role || 'customer').toLowerCase();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Customer Menu Items
  const customerItems = [
    { label: 'Dashboard', path: '/customer-dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Recommendations', path: '/customer-dashboard#recommendations', icon: Sparkles },
    { label: 'Compare', path: '/products', icon: SlidersHorizontal },
    { label: 'Review Intelligence', path: '/customer-dashboard#ai-reviews', icon: ShieldCheck },
    { label: 'Saved Products', path: '/customer-dashboard#saved-products', icon: Heart },
    { label: 'Profile', path: '/customer-dashboard', icon: User },
  ];

  // Sales Person Menu Items
  const salesItems = [
    { label: 'Dashboard', path: '/sales-dashboard', icon: LayoutDashboard },
    { label: 'Active Customers', path: '/sales-dashboard#customers', icon: Users },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Inventory Monitor', path: '/sales-dashboard#inventory', icon: Package },
    { label: 'Compare Tool', path: '/products', icon: SlidersHorizontal },
    { label: 'Recommendations', path: '/sales-dashboard#recommend', icon: Sparkles },
    { label: 'Review Insights', path: '/sales-dashboard#reviews', icon: ShieldCheck },
    { label: 'Profile', path: '/sales-dashboard', icon: User },
  ];

  // Admin Menu Items
  const adminItems = [
    { label: 'Dashboard Overview', path: '/admin-dashboard', icon: LayoutDashboard },
    { label: 'User Governance', path: '/admin-dashboard#users', icon: Users },
    { label: 'Sales Persons', path: '/admin-dashboard#salespersons', icon: UserCheck },
    { label: 'Products & Inventory', path: '/admin-dashboard#inventory', icon: Package },
    { label: 'Review Intelligence', path: '/admin-dashboard#reviews', icon: ShieldCheck },
    { label: 'Analytics & Sales', path: '/admin-dashboard#analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/admin-dashboard#system', icon: Lock },
  ];

  const menuItems = normalizedRole === 'admin' 
    ? adminItems 
    : (normalizedRole === 'salesperson' || normalizedRole === 'sales') 
    ? salesItems 
    : customerItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden" 
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Logo showTagline={false} />
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase text-cyan-300">
              {normalizedRole.toUpperCase()} CONSOLE
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
