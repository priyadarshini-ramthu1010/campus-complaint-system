import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Wrench, Info } from 'lucide-react';

const StudentNotifications = () => {
  const notificationsList = [
    {
      id: 1,
      title: "Complaint Status Updated to In Progress",
      message: "Admin assigned Electrician John to inspect Wi-Fi Router in Lab 3 (CMP-2026-0053).",
      date: "Today, 10:45 AM",
      type: "in_progress",
      unread: true
    },
    {
      id: 2,
      title: "Technician Staff Member Assigned",
      message: "John Electrical has been assigned to your ticket CMP-2026-0053.",
      date: "Today, 09:30 AM",
      type: "assigned",
      unread: true
    },
    {
      id: 3,
      title: "Complaint CMP-2026-0030 Marked as Resolved",
      message: "Water Leakage issue in Hostel Room 102 resolved successfully by Plumber Staff.",
      date: "Yesterday, 04:15 PM",
      type: "resolved",
      unread: false
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-max">
          Notification Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <Bell className="h-7 w-7 text-yellow-300" /> Student Alerts & Messages
        </h1>
        <p className="text-xs text-blue-100 font-semibold">
          Real-time updates regarding your submitted complaints, staff assignments, and repair resolutions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Recent Notifications</h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">
            Mark all as read
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {notificationsList.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                n.unread 
                  ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/50' 
                  : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                n.type === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                n.type === 'in_progress' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                'bg-blue-100 dark:bg-blue-950 text-blue-600'
              }`}>
                {n.type === 'resolved' ? <CheckCircle2 className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-bold">{n.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;
