import React, { useState } from 'react';
import { Settings, ShieldCheck, Lock, Save, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [siteTitle, setSiteTitle] = useState('CampusFix Maintenance Portal');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@campus.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Admin portal settings updated successfully!');
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <Settings className="h-7 w-7 text-purple-400" /> Admin Portal Settings
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Configure system parameters, security policies, and theme settings.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col gap-5">
        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="h-5 w-5 text-purple-400" /> General Admin Configuration
        </h3>

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Portal Name / Title</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Administrator Contact Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <Save className="h-4 w-4" /> Save Admin Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
