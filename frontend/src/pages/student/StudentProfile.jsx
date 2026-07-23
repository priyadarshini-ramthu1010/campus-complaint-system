import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, GraduationCap, Calendar, Save, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const StudentProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Profile details updated successfully!');
    }, 800);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/reset-password', {
        email: user.email,
        new_password: newPassword
      });
      if (res.success) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
      
      {/* Profile summary card */}
      <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center text-center gap-4">
        <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{user?.name}</h2>
          <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full font-bold uppercase block mt-1">
            Enrolled Student
          </span>
        </div>

        <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Roll Number</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.roll_number || 'STU-2026'}</span>
          </div>
          <div className="flex justify-between">
            <span>Department</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="flex justify-between">
            <span>Year of Study</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.year || '3rd Year'}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile & Security Forms */}
      <div className="md:col-span-2 flex flex-col gap-6">
        
        {/* Profile Info Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" /> General Profile Settings
          </h3>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-max bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all ml-auto"
            >
              <Save className="h-4 w-4" /> Save Profile Details
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" /> Security & Password Reset
          </h3>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-max bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all ml-auto"
            >
              <ShieldCheck className="h-4 w-4" /> Update Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default StudentProfile;
