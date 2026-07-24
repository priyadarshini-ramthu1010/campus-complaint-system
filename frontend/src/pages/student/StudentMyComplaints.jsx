import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../../services/api';
import { toast } from 'react-toastify';

import { 
  ListTodo, 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Building2,
  User,
  Wrench,
  FileText
} from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ComplaintTimeline from '../../components/ComplaintTimeline';

const StudentMyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // View Details Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints?limit=100');
      if (res.success && res.data) {
        const compList = res.data.complaints || res.data || [];
        setComplaints(compList);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch your complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  // Filter & Search calculation
  const filteredComplaints = complaints.filter((c) => {
    const q = searchVal.toLowerCase();
    const matchesSearch = !searchVal || (
      (c.complaint_number && c.complaint_number.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at || a.date);
    const dateB = new Date(b.created_at || b.date);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const categories = ['Electrical', 'Plumbing', 'Internet', 'Furniture', 'Cleaning', 'AC/Cooling', 'Other'];

  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse';
      case 'Assigned':
        return 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Pending':
      default:
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Student Complaint Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-2 flex items-center gap-2">
            <ListTodo className="h-7 w-7 text-blue-600 dark:text-blue-400" /> My Submitted Complaints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Track real-time progress, review technician work updates, and audit resolution timeline logs.
          </p>
        </div>

        <Link
          to="/student/complaints/raise"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105"
        >
          <PlusCircle className="h-4 w-4" /> Raise New Complaint
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Complaint ID or Title..."
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <Loader />
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xl">
            📝
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No complaints matching search criteria.</p>
          <Link
            to="/student/complaints/raise"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
          >
            File a New Complaint
          </Link>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-4">Complaint ID</th>
                  <th className="px-5 py-4">Complaint Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted Date</th>
                  <th className="px-5 py-4">Assigned Staff</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-200">
                {paginatedComplaints.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {c.complaint_number || c.complaint_id || c.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 block max-w-xs truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{c.description}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{c.building}</span>
                      <span className="text-[10px] text-slate-400">Room {c.room_number || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        c.priority === 'Emergency' ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                        c.priority === 'High' ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {c.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(c.created_at || c.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      {c.assigned_staff_name ? (
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          🔧 {c.assigned_staff_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Assignment</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 transition-colors text-[11px] flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>Page {page} of {totalPages} ({filteredComplaints.length} complaints)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint View Details Modal */}
      {isDetailsOpen && selectedComplaint && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Complaint Details — ${selectedComplaint.complaint_number || selectedComplaint.complaint_id || selectedComplaint.id}`}
        >
          <div className="flex flex-col gap-5 text-left text-xs">
            
            {/* Primary Details Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{selectedComplaint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                {selectedComplaint.description}
              </p>

              {/* Photo Image Attachment */}
              {(selectedComplaint.image_url || (selectedComplaint.images && selectedComplaint.images.length > 0)) && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56">
                  <img 
                    src={selectedComplaint.image_url ? getMediaUrl(selectedComplaint.image_url) : getMediaUrl(selectedComplaint.images[0].image_path)} 
                    alt="Complaint Issue" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedComplaint.category}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Building</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedComplaint.building}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Room Number</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedComplaint.room_number || 'N/A'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedComplaint.priority || 'Normal'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Staff</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedComplaint.assigned_staff_name || 'Unassigned'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Submitted Date</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{new Date(selectedComplaint.created_at || selectedComplaint.date).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Audit Timeline History */}
            <div className="pt-2">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-3">Status Timeline & Remarks</h4>
              <ComplaintTimeline complaintId={selectedComplaint.id || selectedComplaint._id} />
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default StudentMyComplaints;
