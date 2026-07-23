import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  Wrench, 
  FolderKanban, 
  Building2, 
  GraduationCap, 
  BarChart3, 
  PieChart, 
  Bell, 
  Settings, 
  LogOut, 
  X, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || !['admin', 'super_admin'].includes(user.role)) return null;

  const isSuperAdmin = user.role === 'super_admin' || user.employee_id === 'ADM001';

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Complaints', path: '/admin/complaints', icon: ListTodo },
    { name: 'Staff', path: '/admin/staff', icon: Wrench },
    ...(isSuperAdmin ? [{ name: 'Admin Management', path: '/admin/admins', icon: ShieldCheck }] : []),
    { name: 'Categories', path: '/admin/categories', icon: FolderKanban },
    { name: 'Buildings', path: '/admin/buildings', icon: Building2 },
    { name: 'Departments', path: '/admin/departments', icon: GraduationCap },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0B0F19] text-slate-200 transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-white tracking-tight leading-tight">
                Admin<span className="text-purple-400">Center</span>
              </span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Management Console
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 px-4 pt-5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Admin Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-extrabold text-slate-100 truncate">{user.name}</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-2.5 text-xs font-extrabold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Log Out Admin
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
