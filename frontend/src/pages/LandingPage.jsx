import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Sparkles, 
  Zap, 
  Award, 
  Wrench, 
  FilePlus2, 
  Eye, 
  ArrowRight, 
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Wifi,
  Droplets,
  Lightbulb,
  Wind,
  Armchair,
  Check,
  Users,
  Building2,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const categories = [
    { id: 'electrical', name: 'Electrical & Power', icon: Lightbulb, count: '14 Active', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { id: 'plumbing', name: 'Plumbing & Water', icon: Droplets, count: '8 Active', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { id: 'it', name: 'IT & Wi-Fi Network', icon: Wifi, count: '19 Active', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { id: 'carpentry', name: 'Furniture & Carpentry', icon: Armchair, count: '6 Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { id: 'hvac', name: 'HVAC & Ventilation', icon: Wind, count: '5 Active', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
    { id: 'general', name: 'General Infrastructure', icon: Building2, count: '11 Active', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' }
  ];

  const mockTickets = [
    { id: 'CMP-2026-0891', subject: 'Library 2nd Floor Wi-Fi Router Down', category: 'IT & Network', status: 'In Progress', priority: 'High', time: '10 mins ago' },
    { id: 'CMP-2026-0887', subject: 'Water Leakage in Hostel Block B Restroom', category: 'Plumbing', status: 'Assigned', priority: 'Critical', time: '35 mins ago' },
    { id: 'CMP-2026-0882', subject: 'Projector Power Socket Repair - Seminar Hall 1', category: 'Electrical', status: 'Resolved', priority: 'Medium', time: '2 hours ago' },
  ];

  const faqs = [
    {
      q: 'How do I submit a new complaint on CampusFix?',
      a: 'Simply register as a student using your campus email, log into the Student Portal, and click "Raise Complaint". You can upload photos, specify the location (building & room), and track real-time technician assignment.'
    },
    {
      q: 'Who receives and processes my maintenance request?',
      a: 'The Campus Administrative team immediately receives incoming tickets, reviews urgency, and dispatches specialized technicians (electricians, plumbers, IT engineers) directly to your location.'
    },
    {
      q: 'Can staff and admin personnel log in from the same welcome page?',
      a: 'Yes! Both Students and Management (Staff/Admins) can access their respective portals directly from the unified top navigation bar or the portal quick-select section below.'
    },
    {
      q: 'Is there a way to rate or give feedback on resolved repairs?',
      a: 'Absolutely. Once a technician marks a ticket as resolved, students receive a notification prompt to review the quality of work and submit feedback ratings.'
    }
  ];

  return (
    <div className="bg-transparent min-h-screen flex flex-col justify-between overflow-x-hidden relative text-[#CBD5E1] transition-colors duration-300">
      
      {/* Top Glassmorphic Navigation Bar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-slate-700/60 bg-[#14192d]/80 backdrop-blur-xl sticky top-0 z-50 shadow-md transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-[#2563EB] rounded-2xl text-[#FFFFFF] shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-lg">🛠️</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-[#FFFFFF] tracking-tight">
              Campus<span className="text-[#38BDF8]">Fix</span>
            </span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Dark Mode switch toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border border-slate-700 flex items-center justify-center text-[#CBD5E1] hover:text-[#FFFFFF] hover:bg-slate-800 transition-all shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-[#38BDF8] animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-[#38BDF8]" />}
            </button>

            {user ? (
              <Link 
                to={user.role === 'admin' || user.role === 'super_admin' ? '/admin/dashboard' : '/student/dashboard'} 
                className="text-xs sm:text-sm font-extrabold bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center gap-2"
              >
                <span>Go to {user.role === 'admin' || user.role === 'super_admin' ? 'Admin Dashboard' : 'Student Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-xs sm:text-sm font-bold text-[#CBD5E1] hover:text-[#38BDF8] transition-colors px-3 py-2 rounded-xl"
                >
                  Log In
                </Link>
                <Link 
                  to="/admin/login" 
                  className="text-xs sm:text-sm font-bold text-[#38BDF8] hover:text-[#FFFFFF] transition-colors px-3 py-2 rounded-xl hidden md:block"
                >
                  Management Portal
                </Link>
                <Link 
                  to="/register" 
                  className="text-xs sm:text-sm font-extrabold bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 lg:pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-left flex flex-col items-start">
            
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 rounded-full px-3.5 py-1.5 text-xs font-bold mb-6 backdrop-blur-md shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#38BDF8] animate-pulse" />
              <span>Smart Campus Maintenance Engine</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#FFFFFF] tracking-tight leading-[1.1]"
            >
              Faster Campus Repairs.{' '}
              <span className="text-[#38BDF8] block mt-2">
                Zero Friction & Paperwork.
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg text-[#CBD5E1] leading-relaxed max-w-2xl font-medium"
            >
              CampusFix connects students directly with repair technicians and campus management. Submit maintenance requests, track real-time technician dispatch, and get campus issues fixed in record time.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto text-center text-sm font-extrabold bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1D4ED8] px-7 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group"
              >
                <span>Report an Issue Now</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/login" 
                className="w-full sm:w-auto text-center text-sm font-bold bg-[#14192d]/80 text-[#FFFFFF] hover:bg-slate-800 border border-slate-700 px-7 py-4 rounded-2xl transition-all duration-200 shadow-sm backdrop-blur-md flex items-center justify-center gap-2"
              >
                <GraduationCap className="h-4 w-4 text-[#38BDF8]" />
                <span>Portal Log In</span>
              </Link>
            </motion.div>

            {/* Live Stats Row */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 pt-8 border-t border-slate-700/60 grid grid-cols-3 gap-6 w-full max-w-xl"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight">1,450+</p>
                <p className="text-xs font-semibold text-[#CBD5E1] mt-0.5">Tickets Resolved</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#38BDF8] tracking-tight">&lt; 20m</p>
                <p className="text-xs font-semibold text-[#CBD5E1] mt-0.5">Avg Dispatch Time</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#38BDF8] tracking-tight">99.4%</p>
                <p className="text-xs font-semibold text-[#CBD5E1] mt-0.5">Satisfaction Score</p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive Mock Tracker Card & Campus Visual */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 relative flex flex-col items-center gap-6 justify-center"
          >
            {/* Visual Campus Showcase Card with Photo Background */}
            <div className="w-full max-w-md h-44 rounded-3xl overflow-hidden relative shadow-lg border border-slate-700/80 group">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: `url('/campus-bg.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14192d] via-[#14192d]/50 to-transparent p-5 flex flex-col justify-end text-left text-[#FFFFFF]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] bg-[#14192d]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit mb-1 border border-[#38BDF8]/40">
                  Campus Facilities Hub
                </span>
                <h3 className="text-sm font-bold text-[#FFFFFF]">Smart Infrastructure & Maintenance Tracking</h3>
              </div>
            </div>

            <div className="w-full max-w-md bg-[#14192d]/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative z-10 flex flex-col gap-5 backdrop-blur-md">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#38BDF8] animate-ping" />
                  <span className="font-extrabold text-[#FFFFFF] text-sm">Live Campus Feed</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                  Real-time Sync
                </span>
              </div>

              {/* Tickets List Preview */}
              <div className="flex flex-col gap-3">
                {mockTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 shadow-xs hover:border-[#38BDF8] transition-colors flex flex-col gap-2 text-left"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-[#38BDF8]">{ticket.id}</span>
                      <span className={`font-extrabold px-2 py-0.5 rounded-md ${
                        ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        ticket.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#FFFFFF] line-clamp-1">
                      {ticket.subject}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] font-medium pt-1">
                      <span>Category: <strong className="text-[#38BDF8] font-semibold">{ticket.category}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#CBD5E1]" /> {ticket.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Quick Action Footer */}
              <div className="pt-2">
                <Link 
                  to="/login" 
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] text-[#FFFFFF] hover:bg-[#1D4ED8] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Log in to view your tickets</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#FFFFFF]" />
                </Link>
              </div>

            </div>

            {/* Glow background orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#38BDF8]/10 blur-3xl -z-10 pointer-events-none" />
          </motion.div>

        </motion.div>
      </section>

      {/* Role Portals Showcase Section */}
      <section className="py-16 sm:py-24 bg-[#14192d]/60 relative z-10 border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
              Multi-Role Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#FFFFFF] tracking-tight mt-3">
              Tailored Workspaces For Everyone
            </h2>
            <p className="mt-2 text-sm text-[#CBD5E1] font-medium">
              Dedicated interfaces designed for students, campus technicians, and central administration.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 sm:mt-16"
          >
            
            {/* Student Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-[#14192d]/90 backdrop-blur-md p-8 rounded-3xl text-left border border-slate-700/80 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden group"
            >
              <div className="flex flex-col gap-4">
                <div className="p-3.5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-2xl w-fit border border-[#38BDF8]/30">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#FFFFFF]">Student Portal</h3>
                  <p className="text-xs text-[#CBD5E1] font-medium mt-1 leading-relaxed">
                    Lodge infrastructure complaints, attach proof photos, track live status, and rate completed work.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-[#CBD5E1] pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Instant photo complaint submission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Real-time status progression bar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Direct technician resolution rating</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/login" 
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Student Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            {/* Staff Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-[#14192d]/90 backdrop-blur-md p-8 rounded-3xl text-left border border-slate-700/80 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden group"
            >
              <div className="flex flex-col gap-4">
                <div className="p-3.5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-2xl w-fit border border-[#38BDF8]/30">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#FFFFFF]">Staff Repair Console</h3>
                  <p className="text-xs text-[#CBD5E1] font-medium mt-1 leading-relaxed">
                    View assigned repair jobs, update repair progress, and add resolution notes directly from mobile or desktop.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-[#CBD5E1] pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Assigned repair tickets inbox</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>One-click status state transitions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Completion remarks & timestamps</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/admin/login" 
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Staff Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            {/* Admin Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-[#14192d]/90 backdrop-blur-md p-8 rounded-3xl text-left border border-slate-700/80 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden group"
            >
              <div className="flex flex-col gap-4">
                <div className="p-3.5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-2xl w-fit border border-[#38BDF8]/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#FFFFFF]">Admin Command Center</h3>
                  <p className="text-xs text-[#CBD5E1] font-medium mt-1 leading-relaxed">
                    Overview of campus analytics, technician workload allocation, feedback reviews, and user management.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-[#CBD5E1] pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Technician workload & dispatch matrix</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Full user role & access controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#38BDF8] shrink-0" />
                    <span>Audit logs & satisfaction analytics</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/admin/login" 
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Admin Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight">
              Supported Maintenance Domains
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] font-medium mt-1">
              CampusFix handles infrastructure issues across all campus departments
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div 
                  key={cat.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-5 rounded-2xl bg-[#14192d]/80 backdrop-blur-md border border-slate-700/60 shadow-md flex flex-col items-center text-center gap-3"
                >
                  <div className="p-3 rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-extrabold text-[#FFFFFF]">{cat.name}</h4>
                  <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full border border-[#38BDF8]/20">
                    {cat.count}
                  </span>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="py-16 sm:py-20 bg-[#14192d]/70 backdrop-blur-md border-t border-slate-700/60 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#14192d]/90 rounded-2xl border border-slate-700/70 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#FFFFFF] hover:text-[#38BDF8] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-[#38BDF8] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#CBD5E1] shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 sm:px-5 pb-5 text-xs text-[#CBD5E1] font-medium leading-relaxed border-t border-slate-700/50 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1422] text-[#CBD5E1] py-10 border-t border-slate-800 text-xs font-semibold relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <span className="text-lg">🛠️</span>
            <span className="text-base font-black text-[#FFFFFF] tracking-tight">
              Campus<span className="text-[#38BDF8]">Fix</span>
            </span>
            <span className="text-[11px] text-[#CBD5E1]/70 pl-2 border-l border-slate-700">
              Smart Campus Maintenance ERP
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[#CBD5E1]">
            <Link to="/login" className="hover:text-[#38BDF8] transition-colors">Student Login</Link>
            <Link to="/admin/login" className="hover:text-[#38BDF8] transition-colors">Management Portal</Link>
            <Link to="/register" className="hover:text-[#38BDF8] transition-colors">Register Account</Link>
            <span className="hover:text-[#38BDF8] transition-colors cursor-pointer">System Status</span>
          </div>

          <p className="text-[11px] text-[#CBD5E1]/70">
            © 2026 CampusFix Maintenance Portal. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
