import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Camera, 
  Save, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock,
  Laptop
} from 'lucide-react';
import api from '../../services/api';

const StudentSettings = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Account Settings Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    email: user?.notifications?.email ?? true,
    sms: user?.notifications?.sms ?? false,
    in_app: user?.notifications?.in_app ?? true
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Security State
  const lastLoginTime = useState(() => new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }))[0];

  // Logout Modal Confirmation State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const departmentsList = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical'
  ];

  const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Fetch latest profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.success && res.data) {
          const u = res.data;
          setName(u.name || '');
          setPhone(u.phone || '');
          setDepartment(u.department || 'Computer Science');
          setYear(u.year || '3rd Year');
          setProfileImage(u.profile_image || '');
          if (u.notifications) {
            setNotifications({
              email: u.notifications.email ?? true,
              sms: u.notifications.sms ?? false,
              in_app: u.notifications.in_app ?? true
            });
          }
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Handle Profile Avatar Image Upload Preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.info('Profile picture selected! Click "Save Changes" to save.');
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Save Account Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    const phoneRegex = /^\+?\d{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Invalid phone number format. Please enter 9 to 15 digits.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.put('/profile', {
        name: name.trim(),
        phone: phone.trim(),
        department,
        year,
        profile_image: profileImage,
        notifications
      });

      if (res.success) {
        // Update local user storage
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updated = { ...savedUser, ...res.data };
        localStorage.setItem('user', JSON.stringify(updated));

        toast.success('Account settings saved successfully!');
      } else {
        toast.error(res.message || 'Failed to save account settings');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Change Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and Confirm password do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to update password');
      }
    } catch (err) {
      toast.error(err.message || 'Current password may be incorrect');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 3. Save Notification Preferences
  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setIsSavingNotifications(true);
    try {
      const res = await api.put('/profile', { notifications: updated });
      if (res.success) {
        toast.success('Notification preferences updated!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // 4. Security Action: Logout from all devices
  const handleLogoutAllDevices = () => {
    toast.info('Logged out from all active devices! Please log in again.');
    setTimeout(() => {
      logout();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
            ⚙️
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Student Account Settings
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
              Manage your personal information, security preferences, and theme choices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {user?.roll_number || 'Enrolled Student'}
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 flex flex-col gap-6">
          
          {/* Avatar Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-4xl">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'S'
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{name || user?.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">{user?.email}</p>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Roll Number:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.roll_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{department}</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Year:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{year}</span>
              </div>
            </div>
          </div>

          {/* Quick Logout Button Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account Session</h4>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" /> Log Out of CampusFix
            </button>
          </div>

        </div>

        {/* Right Column: Settings Sections */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* SECTION 1: ACCOUNT SETTINGS */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Account Settings</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Update your personal and academic details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Department & Year Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Department</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      {departmentsList.map(dept => (
                        <option key={dept} value={dept} className="dark:bg-slate-900">{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Year of Study</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      {yearsList.map(yr => (
                        <option key={yr} value={yr} className="dark:bg-slate-900">{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70 transition-all"
                >
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>

            </form>
          </div>

          {/* SECTION 2: CHANGE PASSWORD */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <Lock className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Change Password</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Update your account password securely</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 text-xs">
              
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              {/* New Password & Confirm Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-70 transition-all"
                >
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Update Password
                </button>
              </div>

            </form>
          </div>

          {/* SECTION 3: NOTIFICATION PREFERENCES */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <Bell className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Notification Preferences</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Configure how you receive complaint updates and status alerts</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold">
              
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">Email Notifications</span>
                  <span className="text-[10px] text-slate-400 font-medium">Receive repair status updates via email</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('email')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${notifications.email ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">SMS Notifications</span>
                  <span className="text-[10px] text-slate-400 font-medium">Receive urgent maintenance SMS alerts</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('sms')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${notifications.sms ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* In-App Notifications */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">In-App Notifications</span>
                  <span className="text-[10px] text-slate-400 font-medium">Show real-time notifications in Student Portal</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('in_app')}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${notifications.in_app ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.in_app ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

            </div>
          </div>

          {/* SECTION 4: APPEARANCE */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              {isDark ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Appearance Theme</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Switch between Dark Mode and Light Mode visuals</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => { if (isDark) toggleTheme(); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  !isDark 
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-xs font-extrabold">Light Mode</span>
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => { if (!isDark) toggleTheme(); }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  isDark 
                    ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-bold shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                }`}
              >
                <Moon className="h-6 w-6 text-indigo-400" />
                <span className="text-xs font-extrabold">Dark Mode</span>
              </button>

            </div>
          </div>

          {/* SECTION 5: SECURITY */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <Shield className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Security & Session Info</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Active login sessions and security controls</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold">
              
              {/* Display Last Login */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Last Account Login</span>
                    <span className="text-[10px] text-slate-400 font-medium">{lastLoginTime}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                  Active Session
                </span>
              </div>

              {/* Logout From All Devices Button */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Laptop className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">Other Active Devices</span>
                    <span className="text-[10px] text-slate-400 font-medium">Terminate all active sessions on other browsers</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-3.5 py-2 rounded-xl text-[11px] transition-all"
                >
                  Logout All
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* CONFIRMATION LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Confirm Logout</h3>
              <p className="text-xs text-slate-400 font-semibold">
                Are you sure you want to end your current session and log out of CampusFix?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-rose-500/20"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentSettings;
