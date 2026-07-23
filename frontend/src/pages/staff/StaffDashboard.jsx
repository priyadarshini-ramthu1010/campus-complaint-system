import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Bell, 
  Search, 
  Filter, 
  Eye, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Upload, 
  Wrench, 
  Building2, 
  User, 
  Calendar,
  Hourglass,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ComplaintTimeline from '../../components/ComplaintTimeline';

const StaffDashboard = () => {
  const { user } = useAuth();
  
  // Lists & Stats
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ assignedToday: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Notifications Bell State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);

  // Update Status Form State
  const [statusValue, setStatusValue] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Assigned Complaints for Staff
  const fetchAssignedComplaints = async () => {
    try {
      const res = await api.get('/staff/assigned-complaints');
      if (res.success && res.data) {
        const list = res.data.complaints || res.data || [];
        setComplaints(list);

        // Compute Cards
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        
        const assignedToday = list.filter(c => {
          const dt = (c.assigned_date || c.created_at || '').slice(0, 10);
          return dt === todayStr;
        }).length;
        
        const pending = list.filter(c => c.status === 'Pending').length;
        const inProgress = list.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Waiting for Parts').length;
        const completed = list.filter(c => c.status === 'Resolved' || c.status === 'Closed' || c.status === 'Completed').length;

        setStats({ assignedToday, pending, inProgress, completed });
      }
    } catch (err) {
      console.error('Failed to fetch staff assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Auto-refresh polling every 5 seconds for real-time behavior
  useEffect(() => {
    fetchAssignedComplaints();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchAssignedComplaints();
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkNotifRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      fetchNotifications();
    } catch (err) {}
  };

  // Quick Action: Start Work
  const handleStartWork = async (complaint) => {
    try {
      const res = await api.put(`/complaints/${complaint.id || complaint._id}/status`, {
        status: 'In Progress',
        remarks: 'Technician started maintenance work.'
      });
      if (res.success) {
        toast.success(`Work started on Ticket ${complaint.complaint_number || complaint.title}`);
        fetchAssignedComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Quick Action: Complete Work
  const handleCompleteWork = async (complaint) => {
    try {
      const res = await api.put(`/complaints/${complaint.id || complaint._id}/status`, {
        status: 'Resolved',
        remarks: 'Technician completed all maintenance tasks.'
      });
      if (res.success) {
        toast.success(`Ticket ${complaint.complaint_number || complaint.title} marked as Completed!`);
        fetchAssignedComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Open Update Modal
  const handleOpenUpdateModal = (complaint) => {
    setTargetComplaint(complaint);
    setStatusValue(complaint.status === 'Assigned' ? 'In Progress' : complaint.status);
    setRemarks(complaint.remarks || '');
    setBeforeImage(complaint.before_image || '');
    setAfterImage(complaint.after_image || '');
    setIsUpdateOpen(true);
  };

  // Submit Status Update Modal
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetComplaint) return;

    setIsSubmitting(true);
    try {
      const res = await api.put(`/complaints/${targetComplaint.id || targetComplaint._id}/status`, {
        status: statusValue,
        remarks: remarks || `Status updated to ${statusValue}`,
        before_image: beforeImage,
        after_image: afterImage
      });

      if (res.success) {
        toast.success(`Status updated to ${statusValue} successfully!`);
        setIsUpdateOpen(false);
        fetchAssignedComplaints();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered complaints
  const filteredComplaints = complaints.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (c.complaint_number && c.complaint_number.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.student_name && c.student_name.toLowerCase().includes(q)) ||
      (c.building && c.building.toLowerCase().includes(q))
    );
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'Assigned':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'In Progress':
      case 'Waiting for Parts':
        return 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 animate-pulse';
      case 'Resolved':
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Rejected':
      default:
        return 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-12">
      
      {/* Top Header Banner + Notification Bell */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            Technician Command Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-2 flex items-center gap-2">
            <Wrench className="h-7 w-7 text-purple-600 dark:text-purple-400" /> Welcome, {user?.name || 'Technician'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Department: {user?.department || 'Maintenance'} • ID: {user?.employee_id || 'STF-001'}
          </p>
        </div>

        {/* Notifications Bell Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Bell className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-extrabold hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-4 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-amber-500" /> Notifications ({unreadCount} unread)
                </span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark All Read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold p-4 text-center">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id || n._id}
                      onClick={() => handleMarkNotifRead(n.id || n._id)}
                      className={`p-3 rounded-2xl border text-xs flex flex-col gap-1 cursor-pointer transition-colors ${
                        n.is_read 
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/80 text-slate-500' 
                          : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-100 font-semibold'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{n.message}</p>
                      {n.location && (
                        <span className="text-[10px] text-slate-400 font-medium">📍 {n.location} • Priority: {n.priority}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Assigned Today</span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.assignedToday}</span>
          <span className="text-[10px] text-slate-400 font-semibold">New assignments today</span>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
          <span className="text-3xl font-black text-amber-500">{stats.pending}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Awaiting initial action</span>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">In Progress</span>
          <span className="text-3xl font-black text-orange-500">{stats.inProgress}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Under active maintenance</span>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Completed</span>
          <span className="text-3xl font-black text-emerald-500">{stats.completed}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Resolved work orders</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID, Student, or Building..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Parts">Waiting for Parts</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Table: My Assigned Complaints */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📋 My Assigned Complaints
          </h2>
        </div>

        {loading ? (
          <Loader />
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            No complaints currently assigned to you.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Complaint ID</th>
                  <th className="px-4 py-3.5">Complaint Title</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Building</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Current Status</th>
                  <th className="px-4 py-3.5">Assigned Date</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-200">
                {paginatedComplaints.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {c.complaint_number || c.complaint_id || c.id}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {c.student_name || 'Student'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      {c.department || 'CS'}
                    </td>
                    <td className="px-4 py-3.5 font-bold">{c.building}</td>
                    <td className="px-4 py-3.5">{c.room_number || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        c.priority === 'Emergency' ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200' :
                        c.priority === 'High' ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 border-orange-200' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200'
                      }`}>
                        {c.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(c.assigned_date || c.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>

                        {/* Start Work */}
                        {c.status === 'Assigned' && (
                          <button
                            onClick={() => handleStartWork(c)}
                            className="px-2.5 py-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <PlayCircle className="h-3 w-3" /> Start
                          </button>
                        )}

                        {/* Update Status */}
                        <button
                          onClick={() => handleOpenUpdateModal(c)}
                          className="px-2.5 py-1 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Wrench className="h-3 w-3" /> Update
                        </button>

                        {/* Complete Work */}
                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleCompleteWork(c)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Details */}
      {isDetailsOpen && selectedComplaint && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Task Details — ${selectedComplaint.complaint_number || selectedComplaint.id}`}
        >
          <div className="flex flex-col gap-4 text-xs text-left">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedComplaint.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 font-semibold">{selectedComplaint.description}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-500 font-bold">
                <span>📍 Building: {selectedComplaint.building}</span>
                <span>🚪 Room: {selectedComplaint.room_number || 'N/A'}</span>
                <span>👤 Student: {selectedComplaint.student_name}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-2">Audit History</h4>
              <ComplaintTimeline complaintId={selectedComplaint.id || selectedComplaint._id} />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Update Status */}
      {isUpdateOpen && targetComplaint && (
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          title={`Update Work Status — ${targetComplaint.complaint_number || targetComplaint.id}`}
        >
          <form onSubmit={handleUpdateStatusSubmit} className="flex flex-col gap-4 text-xs text-left">
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Resolved">Resolved (Completed)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Work Remarks / Diagnostic Notes</label>
              <textarea
                rows={3}
                required
                placeholder="Enter repair details, parts used, or inspection updates..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Before Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://example.com/before.jpg"
                value={beforeImage}
                onChange={(e) => setBeforeImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">After Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://example.com/after.jpg"
                value={afterImage}
                onChange={(e) => setAfterImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUpdateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold"
              >
                {isSubmitting ? 'Saving...' : 'Save & Notify Student'}
              </button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
};

export default StaffDashboard;
