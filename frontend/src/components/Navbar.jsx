import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Menu, 
  Settings, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  ChevronDown,
  HelpCircle
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Local States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!user) return null;

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const search = location.search;

    if (path.startsWith('/admin')) {
      if (path.includes('users')) return ['Admin', 'Manage Users'];
      if (path.includes('feedback')) return ['Admin', 'Feedback Logs'];
      return ['Admin', 'Dashboard'];
    }
    if (path.startsWith('/staff')) {
      return ['Technician', 'Work Tasks'];
    }
    if (path.startsWith('/student')) {
      if (path.includes('raise')) return ['Dashboard', 'Raise Complaint'];
      if (search.includes('tab=complaints')) return ['Dashboard', 'My Complaints'];
      if (search.includes('tab=profile')) return ['Dashboard', 'Student Profile'];
      if (search.includes('tab=settings')) return ['Dashboard', 'Settings'];
      if (search.includes('tab=help')) return ['Dashboard', 'Help Center'];
      return ['Dashboard', 'Overview'];
    }
    return ['CampusFix', 'Portal'];
  };

  const breadcrumbs = getBreadcrumbs();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const notifications = [
    { id: 1, text: "Ticket CMP-2026-0034 status updated to In Progress", time: "5m ago", unread: true },
    { id: 2, text: "Repairman Staff 1 assigned to your electrical issue", time: "1h ago", unread: true },
    { id: 3, text: "Your feedback request is ready for review", time: "1d ago", unread: false }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0D1322]/90 backdrop-blur-md shadow-sm px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu, Breadcrumbs & Date */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none lg:hidden p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden md:flex flex-col text-left">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-primary dark:text-blue-400 font-bold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{currentDate}</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search workspaces or complaints..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Right: Toggles, Alerts, Profile dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Dark Mode toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            {/* Notification Drawer Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 overflow-hidden z-50 animate-fade-in text-left">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifications</span>
                  <button className="text-[10px] text-primary dark:text-blue-400 font-bold hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex flex-col gap-1 transition-colors ${item.unread ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-snug">{item.text}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-2 pr-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 overflow-hidden z-50 text-left">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold capitalize">{user.role} workspace</span>
                </div>
                <div className="py-1">
                  <Link 
                    to={user.role === 'student' ? '/student/dashboard?tab=profile' : '#'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    <User className="h-3.5 w-3.5" /> My Profile
                  </Link>
                  <Link 
                    to={user.role === 'student' ? '/student/dashboard?tab=settings' : '#'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                  <Link 
                    to={user.role === 'student' ? '/student/dashboard?tab=help' : '#'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    <HelpCircle className="h-3.5 w-3.5" /> Help Center
                  </Link>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

export default Navbar;
