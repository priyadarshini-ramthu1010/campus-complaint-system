import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Sparkles, 
  PlusCircle, 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  AlertCircle, 
  ChevronRight, 
  Bell, 
  User, 
  ArrowUpRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Loader from '../../components/Loader';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/complaints?limit=50');
        if (res.success && res.data) {
          const compList = res.data.complaints || res.data || [];
          
          const total = compList.length;
          const pending = compList.filter(c => c.status === 'Pending').length;
          const inProgress = compList.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
          const resolved = compList.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

          setStats({ total, pending, inProgress, resolved });
          setRecentComplaints(compList.slice(0, 5)); // Last 5 only
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning 👋';
    if (hr < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
      case 'Assigned':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse';
      case 'Pending':
      default:
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left pb-12">
      
      {/* 1. Welcome Card Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-white/90 border border-white/10 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Smart Campus Maintenance System
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {getGreeting()}, <span className="text-yellow-300">{user?.name || 'Student'}</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            Report infrastructure issues, track live repair status, and review recent maintenance resolution updates across your campus.
          </p>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Student Profile Summary */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{user?.name}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {user?.email} • {user?.roll_number || 'STU-2026'}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
              {user?.department || 'Computer Science'} • {user?.year || '3rd Year'}
            </span>
          </div>
        </div>

        <Link
          to="/student/profile"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          View Full Profile <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 3. Complaint Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Complaints</span>
          <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">Submitted requests</span>
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

      {/* 4. Quick Actions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          ⚡ Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/student/complaints/raise"
            className="p-5 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center justify-between shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <PlusCircle className="h-6 w-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm">Raise New Complaint</span>
                <span className="text-xs text-blue-100 font-normal">Report infrastructure issues</span>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5" />
          </Link>

          <Link
            to="/student/my-complaints"
            className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-extrabold flex items-center justify-between shadow-sm hover:border-blue-500 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                <ListTodo className="h-6 w-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm">View My Complaints</span>
                <span className="text-xs text-slate-400 font-normal">Track your submitted tickets</span>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 5. Recent Complaints (Last 5 only) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Recent Complaints (Last 5 Only)
          </h2>

          <Link
            to="/student/my-complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            View All My Complaints <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : recentComplaints.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-slate-400">No complaints filed yet.</p>
            <Link
              to="/student/complaints/raise"
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Raise Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            {recentComplaints.map((comp) => (
              <div
                key={comp._id || comp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {comp.complaint_number || comp.title}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {comp.category}
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
                    to="/student/my-complaints"
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

      {/* 6. Recent Notifications */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" /> Recent Notifications
          </h2>

          <Link
            to="/student/notifications"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            View Notifications <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 pt-1 text-xs text-left">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-start gap-3">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">System Ready for Repair Requests</span>
              <span className="text-[10px] text-slate-400">CampusFix Maintenance Dispatch Service is operational.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
