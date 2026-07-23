import React from 'react';
import { PieChart, TrendingUp, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            Performance Metrics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <PieChart className="h-7 w-7 text-purple-400" /> System Analytics & Insights
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Real-time analytics on maintenance turnaround times, issue categories, and staff response efficiency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg SLA Turnaround</span>
          <span className="text-3xl font-black text-purple-400">14.2 Hrs</span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1">↓ 18% faster than last month</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resolution Rate</span>
          <span className="text-3xl font-black text-emerald-400">92.4%</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">46 out of 50 tickets resolved</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Technicians</span>
          <span className="text-3xl font-black text-blue-400">6 Technicians</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">Deployed across 6 categories</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Student Satisfaction</span>
          <span className="text-3xl font-black text-amber-400">4.8 / 5.0</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-1">Based on student ratings</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
