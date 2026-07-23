import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  X, 
  Wrench,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const StudentSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'student') return null;

  const menuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Raise Complaint', path: '/student/complaints/raise', icon: PlusCircle },
    { name: 'My Complaints', path: '/student/my-complaints', icon: ListTodo },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const isItemActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              🛠️
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Campus<span className="text-blue-600 dark:text-blue-400">Fix</span>
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Student Portal
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 px-4 pt-6">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Student Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">
                {user.department || 'Computer Science'} • {user.year || '3rd Year'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-3 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
