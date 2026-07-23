import React from 'react';
import { BarChart3, FileSpreadsheet, Download, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminReports = () => {
  const handleExport = (reportName) => {
    toast.success(`Exporting "${reportName}" to CSV file...`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            Data Export & Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-purple-400" /> System Reports & Exports
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Generate and download analytical reports for maintenance resolution timelines, staff workloads, and category metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-lg hover:border-purple-800/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="h-12 w-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center text-xl">
              📊
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Monthly Complaint Audit</h3>
            <p className="text-xs text-slate-400 font-semibold">Comprehensive breakdown of all complaints submitted in the past 30 days.</p>
          </div>
          <button
            onClick={() => handleExport("Monthly Complaint Audit")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="h-4 w-4" /> Export CSV Report
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-lg hover:border-purple-800/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center text-xl">
              🛠️
            </div>
            <h3 className="text-base font-extrabold text-slate-100">Staff Workload Report</h3>
            <p className="text-xs text-slate-400 font-semibold">Technician assignment breakdown, resolution speed, and pending task queues.</p>
          </div>
          <button
            onClick={() => handleExport("Staff Workload Report")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="h-4 w-4" /> Export CSV Report
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-lg hover:border-purple-800/60 transition-all">
          <div className="flex flex-col gap-2">
            <div className="h-12 w-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <h3 className="text-base font-extrabold text-slate-100">SLA Performance Report</h3>
            <p className="text-xs text-slate-400 font-semibold">Analysis of target vs actual resolution times across departments and buildings.</p>
          </div>
          <button
            onClick={() => handleExport("SLA Performance Report")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="h-4 w-4" /> Export CSV Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
