import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, GraduationCap, Calendar, Lock, Eye, EyeOff, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import ColorChangingEmailInput from '../components/ColorChangingEmailInput';
import AIAssistantWidget from '../components/AIAssistantWidget';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const emailValue = watch('email');

  const onSubmit = async (data) => {
    setIsSubmittingState(true);
    const result = await registerAuth(data);
    
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } else {
      if (result.errors && typeof result.errors === 'object' && Object.keys(result.errors).length > 0) {
        Object.values(result.errors).forEach(err => {
          if (typeof err === 'string') toast.error(err);
        });
      } else {
        toast.error(result.message || 'Registration failed');
      }
    }
    setIsSubmittingState(false);
  };

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 bg-transparent relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
        className="w-full max-w-lg glass-card rounded-3xl p-8 border border-white/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 shadow-2xl flex flex-col gap-6 transition-colors duration-300"
      >
        
        {/* Header */}
        <div className="relative text-center flex flex-col gap-2">
          {/* Dark mode toggle button */}
          <div className="absolute right-0 top-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <Link to="/" className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-xl text-white text-xs">🛠️</span>
            Campus<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fix</span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Student Registration</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Join the campus maintenance portal to report repairs</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Full Name */}
          <div className="flex flex-col gap-1.5 sm:col-span-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Alice Scholar"
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200 ${
                  errors.name ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800 focus:border-blue-500'
                }`}
                {...register('name', { required: 'Full name is required' })}
              />
            </div>
            {errors.name && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.name.message}</span>}
          </div>

          {/* Roll Number */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Roll Number</label>
            <input
              type="text"
              placeholder="STU-2026-1001 (Optional)"
              className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200 ${
                errors.roll_number ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800 focus:border-blue-500'
              }`}
              {...register('roll_number')}
            />
            {errors.roll_number && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.roll_number.message}</span>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="9876543210"
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200 ${
                  errors.phone ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800 focus:border-blue-500'
                }`}
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: { value: /^\+?\d{9,15}$/, message: 'Valid 9-15 digit phone required' }
                })}
              />
            </div>
            {errors.phone && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.phone.message}</span>}
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Department</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <select
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200 appearance-none ${
                  errors.department ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800 focus:border-blue-500'
                }`}
                {...register('department', { required: 'Department selection is required' })}
              >
                <option value="" className="dark:bg-slate-900">Select Dept</option>
                {departments.map(dept => <option key={dept} value={dept} className="dark:bg-slate-900">{dept}</option>)}
              </select>
            </div>
            {errors.department && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.department.message}</span>}
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Year of Study</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <select
                className={`w-full rounded-2xl border bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all duration-200 appearance-none ${
                  errors.year ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800 focus:border-blue-500'
                }`}
                {...register('year', { required: 'Academic year is required' })}
              >
                <option value="" className="dark:bg-slate-900">Select Year</option>
                {years.map(yr => <option key={yr} value={yr} className="dark:bg-slate-900">{yr}</option>)}
              </select>
            </div>
            {errors.year && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.year.message}</span>}
          </div>

          {/* Email Address with Dynamic Letter Typing Color Shift */}
          <div className="sm:col-span-2 text-left">
            <ColorChangingEmailInput
              value={emailValue}
              placeholder="Enter your email address"
              error={errors.email}
              registerProps={register('email', { 
                required: 'Email address is required',
                pattern: {
                  value: /^[\w\.\+-]+@[\w\.-]+\.\w+$/,
                  message: 'Invalid email address format'
                }
              })}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 sm:col-span-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full rounded-2xl border-2 bg-slate-50 dark:bg-slate-900/90 pl-11 pr-11 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 caret-blue-600 dark:caret-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                  errors.password ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200/80 dark:border-slate-800'
                }`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-red-500 font-semibold pl-1">{errors.password.message}</span>}
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 mt-2">
            <button
              type="submit"
              disabled={isSubmittingState}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/15 disabled:opacity-75 flex items-center justify-center gap-2"
            >
              {isSubmittingState ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Registering...
                </>
              ) : (
                'Register Account'
              )}
            </button>
          </div>

        </form>

        {/* Link back to logins */}
        <div className="text-center text-xs text-slate-400 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold transition-colors">
            Log In
          </Link>
        </div>

      </motion.div>
      <AIAssistantWidget />
    </div>
  );
};

export default Register;
