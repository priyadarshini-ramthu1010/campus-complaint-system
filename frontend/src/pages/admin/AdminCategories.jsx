import React, { useState } from 'react';
import { FolderKanban, Plus, Search, Edit3, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminCategories = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Electrical Maintenance', code: 'ELEC', icon: '⚡', slaHours: 24, activeIssues: 12, status: 'Active' },
    { id: '2', name: 'Plumbing & Water Supply', code: 'PLUMB', icon: '🚰', slaHours: 12, activeIssues: 8, status: 'Active' },
    { id: '3', name: 'IT & Wi-Fi Networking', code: 'IT', icon: '🌐', slaHours: 6, activeIssues: 15, status: 'Active' },
    { id: '4', name: 'Carpentry & Furniture', code: 'CARP', icon: '🪑', slaHours: 48, activeIssues: 5, status: 'Active' },
    { id: '5', name: 'Sanitation & Housekeeping', code: 'SAN', icon: '🧹', slaHours: 12, activeIssues: 7, status: 'Active' },
    { id: '6', name: 'HVAC & Air Conditioning', code: 'HVAC', icon: '❄️', slaHours: 24, activeIssues: 4, status: 'Active' }
  ]);

  const [searchVal, setSearchVal] = useState('');

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    c.code.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            System Classification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-purple-400" /> Complaint Categories & SLA
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Define issue categories, default SLA resolution hours, and work allocation logic.
          </p>
        </div>

        <button
          onClick={() => toast.info('Category Creation Modal')}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search category name or code..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold">{filteredCategories.length} Categories</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCategories.map(cat => (
          <div key={cat.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between gap-4 shadow-lg hover:border-purple-800/60 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 text-2xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-100 text-sm">{cat.name}</span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{cat.code}</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {cat.status}
              </span>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> SLA: {cat.slaHours} Hours
              </span>
              <span className="text-purple-300 font-bold">{cat.activeIssues} Active Tickets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
