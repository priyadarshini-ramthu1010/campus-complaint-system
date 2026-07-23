import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Wrench, Info, Check } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-max">
          Notification Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <Bell className="h-7 w-7 text-yellow-300" /> Student Alerts & Updates
        </h1>
        <p className="text-xs text-blue-100 font-semibold">
          Real-time alerts regarding staff assignments, status changes, and repair completion on your tickets.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Live Notifications</h2>
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400">
            No notifications available yet. You will be notified here as soon as staff updates your complaints!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div 
                key={n.id || n._id} 
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.is_read 
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60' 
                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  n.title?.includes('Resolved') ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                  n.title?.includes('Progress') ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                  'bg-blue-100 dark:bg-blue-950 text-blue-600'
                }`}>
                  {n.title?.includes('Resolved') ? <CheckCircle2 className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(n.created_at).toLocaleDateString('en-IN')} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
