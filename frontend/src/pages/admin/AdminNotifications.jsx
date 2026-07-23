import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminNotifications = () => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('Notification message is required');
      return;
    }
    toast.success(`System broadcast sent to ${targetAudience.toUpperCase()} users!`);
    setBroadcastMessage('');
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            System Communication
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <Bell className="h-7 w-7 text-purple-400" /> Admin Broadcast & Alerts
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Send real-time system alerts and maintenance announcements to students and staff.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col gap-5 max-w-2xl">
        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Send className="h-5 w-5 text-purple-400" /> Send Broadcast Announcement
        </h3>

        <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Campus Users (Students & Staff)</option>
              <option value="students">Students Only</option>
              <option value="staff">Staff Members Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Announcement Message</label>
            <textarea
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Scheduled power maintenance in Tech Block A on Friday from 2 PM to 4 PM."
              className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <Send className="h-4 w-4" /> Send Announcement Broadcast
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNotifications;
