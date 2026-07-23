import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  HelpCircle, 
  X, 
  Info,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

import ColorChangingEmailInput from '../../components/ColorChangingEmailInput';
import AIAssistantWidget from '../../components/AIAssistantWidget';

const ManagementLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  
  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const emailValue = watch('email');

  const handleQuickFillAdmin = () => {
    setValue('email', 'admin@campus.com', { shouldValidate: true });
    setValue('password', 'Password123', { shouldValidate: true });
    toast.info('Pre-filled Super Admin credentials!', { autoClose: 2000 });
  };

  const onSubmit = async (data) => {
    setIsSubmittingState(true);

    if (rememberMe) {
      localStorage.setItem('campusfix_remembered_admin_email', data.email);
    } else {
      localStorage.removeItem('campusfix_remembered_admin_email');
    }

    const result = await login(data.email, data.password);
    
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = savedUser?.role;

      if (userRole === 'admin' || userRole === 'super_admin') {
        toast.success(`Authenticated — Welcome to Admin Command Center, ${savedUser.name || 'Admin'}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error('Access Denied. Only Admin accounts can access the Management Portal.');
      }
    } else {
      toast.error(result.message || 'Authentication failed. Please verify admin credentials.');
    }
    setIsSubmittingState(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    setIsSendingReset(true);
    try {
      const res = await api.post('/reset-password', {
        email: forgotEmail,
        new_password: newPassword
      });
      if (res.success) {
        toast.success(res.message || 'Password updated successfully!');
        setIsForgotPasswordOpen(false);
        setValue('email', forgotEmail);
        setValue('password', newPassword);
        setForgotEmail('');
        setNewPassword('');
      } else {
        toast.error(res.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.message || 'No admin account found with this email');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-transparent relative z-10">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
        className="w-full max-w-md bg-slate-950/85 text-slate-100 rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="relative text-center flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Admin <span className="text-purple-400">Command Center</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Management Portal Sign-In
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
          
          {/* Email Input with Dynamic Letter Typing Color Shift */}
          <ColorChangingEmailInput
            value={emailValue}
            placeholder="admin@campus.com"
            error={errors.email}
            registerProps={register('email', { 
              required: 'Admin email is required',
              pattern: { value: /^[\w\.\+-]+@[\w\.-]+\.\w+$/, message: 'Invalid format' }
            })}
          />

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[11px] font-bold text-purple-400 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full rounded-2xl border bg-slate-950 pl-11 pr-11 py-3 text-xs sm:text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all ${
                  errors.password ? 'border-rose-500' : 'border-slate-800'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-rose-400 font-semibold">{errors.password.message}</span>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-400 font-semibold">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="text-[10px] font-bold text-purple-400 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 px-2.5 py-1 rounded-xl transition-all"
            >
              Demo Admin Fill
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingState}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-600/30 disabled:opacity-75 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmittingState ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In to Admin Center <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Enterprise Notice (Replacing Create Account) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-left">
          <Info className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Administrator accounts are managed by the System Administrator.
          </p>
        </div>

        {/* Link back to Student Portal */}
        <div className="text-center text-xs text-slate-500 font-semibold border-t border-slate-800/80 pt-4">
          Are you a Student?{' '}
          <Link to="/login" className="text-purple-400 font-extrabold hover:underline">
            Go to Student Portal
          </Link>
        </div>

      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0B0F19] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 flex flex-col gap-4 relative text-left"
            >
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-950 text-purple-400 rounded-2xl border border-purple-800">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Admin Password</h3>
                  <p className="text-xs text-slate-400">Set a new password for your admin account</p>
                </div>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-3 mt-2 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Admin Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@campus.com"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-1.5"
                  >
                    {isSendingReset ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Update Admin Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManagementLogin;
