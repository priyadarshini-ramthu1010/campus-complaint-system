import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import ColorChangingEmailInput from '../components/ColorChangingEmailInput';
import AIAssistantWidget from '../components/AIAssistantWidget';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  GraduationCap, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

const Login = ({ initialRole = 'student' }) => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialRole); // 'student' | 'staff' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { register, handleSubmit, reset, clearErrors, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    mode: 'onChange'
  });

  const emailValue = watch('email') || '';
  const passwordValue = watch('password') || '';

  // Validation RegEx Patterns
  const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\?.,])[A-Za-z\d!@#$%^&*()_+\-=\?.,]{8,20}$/;

  const isEmailValid = GMAIL_REGEX.test(emailValue);
  const isPasswordValid = STRONG_PASSWORD_REGEX.test(passwordValue);

  // Explicitly clear email, password, and validation errors when switching tabs
  useEffect(() => {
    reset({
      email: '',
      password: '',
      rememberMe: false
    });
    clearErrors();
  }, [activeTab, reset, clearErrors]);

  const handleTabChange = (roleKey) => {
    setActiveTab(roleKey);
  };

  const onSubmit = async (data) => {
    if (!isEmailValid || !isPasswordValid) {
      toast.error('Please fix validation errors before logging in.');
      return;
    }

    setIsSubmittingState(true);

    if (rememberMe) {
      localStorage.setItem('campusfix_remembered_email', data.email);
    } else {
      localStorage.removeItem('campusfix_remembered_email');
    }

    const result = await login(data.email, data.password, activeTab);
    
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = savedUser?.role;

      if (userRole === 'student') {
        toast.success(`Welcome back, ${savedUser.name || 'Student'}!`);
        navigate('/student/dashboard');
      } else if (userRole === 'admin' || userRole === 'super_admin') {
        toast.success(`Management Portal Authenticated (${userRole === 'super_admin' ? 'Super Admin' : 'Admin'})`);
        navigate('/admin/dashboard');
      } else if (userRole === 'staff') {
        toast.success('Management Portal Authenticated (Staff)');
        navigate('/staff/dashboard');
      } else {
        toast.success('Successfully logged in!');
        navigate('/student/dashboard');
      }
    } else {
      toast.error(result.message || 'Authentication failed. Please verify credentials.');
    }
    setIsSubmittingState(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!GMAIL_REGEX.test(forgotEmail)) {
      toast.error('Please enter a valid Gmail address');
      return;
    }
    if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
      toast.error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    setIsSendingReset(true);
    try {
      const res = await api.post('/reset-password', {
        email: forgotEmail,
        new_password: newPassword
      });
      if (res.success) {
        toast.success(res.message || 'Password reset successfully! You can now log in with your new password.');
        setIsForgotPasswordOpen(false);
        setForgotEmail('');
        setNewPassword('');
      } else {
        toast.error(res.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.message || 'No account found with this email address');
    } finally {
      setIsSendingReset(false);
    }
  };

  const rolesConfig = {
    student: {
      title: 'Student Portal',
      subtitle: 'Sign in to report issues or check maintenance updates',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
      btnText: 'Sign In to Student',
      emailPlaceholder: 'Enter your student email',
      passwordPlaceholder: 'Enter your password',
      footerInfo: null
    },
    staff: {
      title: 'Staff Maintenance Console',
      subtitle: 'Sign in to manage assigned repairs and updates',
      icon: Wrench,
      color: 'from-violet-600 to-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      btnColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20',
      btnText: 'Sign In to Staff',
      emailPlaceholder: 'Enter your staff email',
      passwordPlaceholder: 'Enter your password',
      footerInfo: 'Staff accounts are created by the Campus Administration.'
    },
    admin: {
      title: 'Admin Command Center',
      subtitle: 'Sign in for system administration & user allocation',
      icon: ShieldCheck,
      color: 'from-slate-800 to-indigo-900',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      btnColor: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
      btnText: 'Sign In to Admin',
      emailPlaceholder: 'Enter admin email',
      passwordPlaceholder: 'Enter admin password',
      footerInfo: 'Administrator accounts are managed by the system owner.'
    }
  };

  const currentRole = rolesConfig[activeTab];
  const ActiveRoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
      
      {/* Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/60 grid grid-cols-1 lg:grid-cols-12"
      >
        
        {/* Left Side: Brand Highlight Panel */}
        <div className="lg:col-span-5 bg-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Photorealistic Campus Background Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-75 scale-100" 
            style={{ backgroundImage: `url('/campus-bg.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-blue-950/70" />
          
          {/* Ambient shapes */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🛠️</span>
              </div>
              <span className="text-2xl font-black tracking-tight">
                Campus<span className="text-blue-300">Fix</span>
              </span>
            </Link>

            <div className="space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                Next-Gen Campus Issue System
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Streamlined Repairs & Maintenance
              </h1>
              <p className="text-sm text-blue-100/80 font-normal leading-relaxed">
                Report infrastructure issues, track live technician dispatch, and ensure a seamless campus environment.
              </p>
            </div>
          </div>

          {/* Feature highlights list */}
          <div className="relative z-10 my-8 space-y-3.5">
            {[
              'Instant ticket creation with photo attachments',
              'Real-time status updates & SMS/Email alerts',
              'Automated technician department routing',
              'Dedicated portals for Students, Staff & Admins'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-blue-100 font-medium">
                <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* System Status Pill */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
            <span className="font-mono text-[11px] opacity-75">v2.4 Live</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Workspace */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between gap-6 transition-colors duration-300">
          
          <div>
            {/* Header + Role Tabs */}
            <div className="flex flex-col gap-5 mb-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {currentRole.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {currentRole.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Dark Mode toggle button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5" />}
                  </button>
                  <div className={`p-3 rounded-2xl border ${currentRole.badge} transition-colors hidden sm:block`}>
                    <ActiveRoleIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Multi-Role Switcher Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                {[
                  { key: 'student', label: 'Student', icon: GraduationCap },
                  { key: 'staff', label: 'Staff', icon: Wrench },
                  { key: 'admin', label: 'Admin', icon: ShieldCheck }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`relative py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/80 dark:border-slate-700 font-extrabold' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" autoComplete="off">
              
              {/* Email Input */}
              <ColorChangingEmailInput
                value={emailValue}
                placeholder={currentRole.emailPlaceholder}
                error={errors.email}
                registerProps={register('email', {
                  required: 'Please enter a valid Gmail address.',
                  pattern: {
                    value: GMAIL_REGEX,
                    message: 'Please enter a valid Gmail address.'
                  }
                })}
              />

              {/* Password Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Password
                  </label>

                  {/* Live Password Validation Badge */}
                  {passwordValue.length > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all duration-300 ${
                      isPasswordValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800'
                    }`}>
                      {isPasswordValid ? '✔ Strong Password' : '❌ Weak Password'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-auto"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={currentRole.passwordPlaceholder}
                    autoComplete="new-password"
                    className={`w-full rounded-2xl border-2 bg-slate-50 dark:bg-slate-900/90 pl-11 pr-11 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 caret-blue-600 dark:caret-white focus:outline-none transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20' 
                        : isPasswordValid 
                        ? 'border-emerald-500 dark:border-emerald-400 focus:ring-emerald-500/20' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    {...register('password', {
                      required: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
                      pattern: {
                        value: STRONG_PASSWORD_REGEX,
                        message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] text-red-500 font-semibold pl-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" />
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember my email</span>
                </label>
              </div>

              {/* Submit CTA Button — Blocked until both Email & Password are valid */}
              <button
                type="submit"
                disabled={!isEmailValid || !isPasswordValid || isSubmittingState}
                className={`w-full text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${currentRole.btnColor} shimmer-trigger`}
              >
                {isSubmittingState ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{currentRole.btnText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Footer Links */}
          <div className="pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-semibold">
            {activeTab === 'student' ? (
              <div>
                New Student?{' '}
                <Link to="/register" className="text-blue-600 font-extrabold hover:underline">
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="text-slate-400 font-medium">
                {currentRole.footerInfo}
              </div>
            )}
            <div>
              Back to{' '}
              <Link to="/" className="text-slate-700 dark:text-slate-300 font-extrabold hover:underline">
                Home
              </Link>
            </div>
          </div>

        </div>

      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-left">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Reset Password</h3>
            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-500 uppercase text-[10px] font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-slate-500 uppercase text-[10px] font-bold">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {isSendingReset ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive AI Floating Widget */}
      <AIAssistantWidget />

    </div>
  );
};

export default Login;
