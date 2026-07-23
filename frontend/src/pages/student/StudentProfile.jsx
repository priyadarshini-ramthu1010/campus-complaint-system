import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  Hourglass, 
  AlertCircle, 
  Settings as SettingsIcon,
  FileText,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';

const StudentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile
        const profRes = await api.get('/profile');
        if (profRes.success && profRes.data) {
          setProfileData(profRes.data);
        }

        // Fetch student's complaints for statistics & history
        const compRes = await api.get('/complaints?limit=50');
        if (compRes.success && compRes.data) {
          const compList = compRes.data.complaints || compRes.data || [];
          setComplaints(compList);

          const total = compList.length;
          const pending = compList.filter(c => c.status === 'Pending').length;
          const inProgress = compList.filter(c => c.status === 'In Progress').length;
          const resolved = compList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

          setStats({ total, pending, inProgress, resolved });
        }
      } catch (err) {
        console.error("Error fetching student profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentUser = profileData || user;

  const joinedDate = currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'July 2026';

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse';
      case 'Pending':
      default:
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 text-left pb-12">
      
      {/* 1. Header Banner & Identity Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Avatar & Primary Info */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-3xl sm:text-4xl flex-shrink-0 overflow-hidden">
            {currentUser?.profile_image ? (
              <img src={currentUser.profile_image} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {currentUser?.name || 'Student Name'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase">
                Active Student
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-500" /> {currentUser?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {currentUser?.roll_number || 'STU-2026'}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentUser?.department || 'Computer Science'}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentUser?.year || '3rd Year'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Edit Profile Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/settings')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
          >
            <SettingsIcon className="h-4 w-4" /> Edit Profile & Settings
          </button>
        </div>

      </div>

      {/* 2. Personal Information Grid */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="h-5 w-5 text-blue-600" /> Student Profile Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.name}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Roll Number</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.roll_number || 'STU-2026'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">{currentUser?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.phone || 'N/A'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.department || 'Computer Science'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Year of Study</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{currentUser?.year || '3rd Year'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1 sm:col-span-2 md:col-span-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Member Since</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" /> Account Created: {joinedDate}
            </span>
          </div>

        </div>
      </div>

      {/* 3. Complaint Analytics & Statistics Cards */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" /> Complaint Analytics & Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Total Complaints */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Filed</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1">Submitted repair requests</span>
          </div>

          {/* Pending */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Hourglass className="h-3 w-3" /> Pending
            </span>
            <span className="text-3xl font-black text-amber-500">{stats.pending}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1">Awaiting staff review</span>
          </div>

          {/* In Progress */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" /> In Progress
            </span>
            <span className="text-3xl font-black text-blue-500">{stats.inProgress}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1">Under active repair</span>
          </div>

          {/* Resolved */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Resolved
            </span>
            <span className="text-3xl font-black text-emerald-500">{stats.resolved}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1">Completed repairs</span>
          </div>

        </div>
      </div>

      {/* 4. Recent Complaint History */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Recent Complaint History
          </h2>

          <Link
            to="/student/complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            View All ({complaints.length}) <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl">
              📝
            </div>
            <p className="text-xs font-semibold text-slate-400">No complaints submitted yet.</p>
            <Link
              to="/student/complaints/raise"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
            >
              File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {complaints.slice(0, 5).map((comp) => (
              <div
                key={comp._id || comp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
              >
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {comp.complaint_id || comp.title}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {comp.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                    {comp.description}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    📍 {comp.building} {comp.room_number ? `• Room ${comp.room_number}` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(comp.status)}`}>
                    {comp.status}
                  </span>
                  <Link
                    to="/student/complaints"
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default StudentProfile;
