import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Users, 
  MessageSquare, 
  Wrench,
  X,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const menuItems = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Raise Complaint', path: '/student/complaints/raise', icon: PlusCircle },
      { name: 'My Complaints', path: '/student/dashboard?tab=complaints', icon: ListTodo },
      { name: 'Profile', path: '/student/dashboard?tab=profile', icon: User },
      { name: 'Settings', path: '/student/dashboard?tab=settings', icon: Settings },
      { name: 'Help Center', path: '/student/dashboard?tab=help', icon: HelpCircle },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Feedback Logs', path: '/admin/feedback', icon: MessageSquare },
    ],
    staff: [
      { name: 'My Tasks', path: '/staff/dashboard', icon: Wrench },
    ]
  };

  const currentMenu = menuItems[role] || [];

  const isItemActive = (item) => {
    if (item.path.includes('?')) {
      const [path, search] = item.path.split('?');
      return location.pathname === path && location.search === `?${search}`;
    }
    if (item.path === '/student/dashboard') {
      return location.pathname === '/student/dashboard' && !location.search;
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-[#FAFBFC] dark:bg-[#0D1322] transition-colors duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header container */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Maintenance Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1.5 px-4 pt-6">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border border-transparent ${
                  active
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 text-primary dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {/* Active indicator bar */}
                <div className={`absolute left-0 top-1/4 h-1/2 w-1 rounded-r bg-primary dark:bg-blue-500 transition-transform duration-200 ${
                  active ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50'
                }`} />
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100/80 dark:border-slate-800 flex flex-col gap-3">
          {/* User Card */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100/50 dark:border-slate-800">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {role === 'student' ? `${user.department || 'CS'} • ${user.year || '3rd Year'}` : role}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200 border border-transparent"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
