import React, { useState, useEffect } from 'react';
import api, { getMediaUrl } from '../../services/api';
import { toast } from 'react-toastify';

import { 
  ListTodo, 
  Search, 
  Filter, 
  UserCheck, 
  Clock, 
  Trash2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ComplaintTimeline from '../../components/ComplaintTimeline';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [statusValue, setStatusValue] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchVal,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      };
      const res = await api.get('/complaints', { params });
      if (res.success && res.data) {
        setComplaints(res.data.complaints);
        setTotalCount(res.data.pagination.total_count);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'staff' } });
      if (res.success) {
        setStaffList(res.data.users);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, [page, searchVal, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchStaff();
  }, []);

  // Staff Assignment Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedStaffId) return;

    setAssignSubmitting(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}/assign`, {
        staff_id: selectedStaffId,
        remarks: assignRemarks
      });
      if (res.success) {
        toast.success('Staff technician assigned successfully! Notification sent to staff.');
        setIsAssignOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to assign staff member');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Admin Approve Work
  const handleApproveWork = async () => {
    if (!selectedComplaint) return;

    setVerifySubmitting(true);
    try {
      const res = await api.put('/admin/approve-work', {
        complaint_id: selectedComplaint.id,
        remarks: 'Work inspected and approved by Admin.'
      });
      if (res.success) {
        toast.success(`Complaint ${selectedComplaint.complaint_number} Approved & Resolved! Student notified.`);
        setIsVerifyOpen(false);
        setIsDetailsOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve work');
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Admin Reject Work (Reopen)
  const handleRejectWork = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is mandatory');
      return;
    }

    setVerifySubmitting(true);
    try {
      const res = await api.put('/admin/reject-work', {
        complaint_id: selectedComplaint.id,
        reason: rejectionReason
      });
      if (res.success) {
        toast.warn(`Work rejected for ${selectedComplaint.complaint_number}. Complaint Reopened & sent back to Staff.`);
        setIsVerifyOpen(false);
        setIsDetailsOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject work');
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Standard Status Update Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !statusValue) return;

    setStatusSubmitting(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: statusValue,
        remarks: statusRemarks.trim() || `Status updated to ${statusValue}`
      });
      if (res.success) {
        toast.success(`Complaint status updated to ${statusValue}!`);
        setIsStatusOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (complaints.length === 0) {
      toast.info("No complaint records to export");
      return;
    }
    const headers = ["Complaint ID,Student Name,Roll Number,Department,Title,Category,Priority,Status,Building,Room,Assigned Staff,Created At"];
    const rows = complaints.map(c => 
      `"${c.complaint_number}","${c.student_name}","${c.roll_number}","${c.department}","${c.title}","${c.category}","${c.priority}","${c.status}","${c.building}","${c.room_number}","${c.assigned_staff_name || 'Unassigned'}","${c.created_at}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_complaints_admin_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("All complaints exported to CSV!");
  };

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case 'Assigned':
      case 'Accepted':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'Pending':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'In Progress':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800';
      case 'Waiting for Admin Verification':
      case 'Completed by Staff':
        return 'bg-purple-950 text-purple-400 border-purple-800 animate-pulse';
      case 'Resolved':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'Reopened':
      case 'Rejected':
      default:
        return 'bg-rose-950 text-rose-400 border-rose-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            Admin Maintenance Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <ListTodo className="h-7 w-7 text-purple-400" /> Complaint Verification & Staff Allocation
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Assign maintenance staff, review work completion reports with before/after photos, and approve or reopen tickets.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Complaints CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID, title, student name..."
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending (Yellow)</option>
            <option value="Assigned">Assigned (Blue)</option>
            <option value="In Progress">In Progress (Yellow/Orange)</option>
            <option value="Waiting for Admin Verification">Waiting Verification (Purple)</option>
            <option value="Resolved">Resolved (Green)</option>
            <option value="Reopened">Reopened (Red)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-sm">
          No complaints registered in system matching filter parameters.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Ticket ID & Date</th>
                  <th className="px-5 py-4">Student Info</th>
                  <th className="px-5 py-4">Complaint Title</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority & Status</th>
                  <th className="px-5 py-4">Assigned Staff</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                {complaints.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <span className="font-bold text-purple-400 block">{c.complaint_number || c.id}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-100 block">{c.student_name}</span>
                      <span className="text-[10px] text-slate-400">{c.roll_number} • {c.department}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-slate-100 block max-w-xs truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{c.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-200 block">{c.building}</span>
                      <span className="text-[10px] text-slate-400">Room {c.room_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          c.priority === 'Emergency' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                          c.priority === 'High' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {c.priority}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {c.assigned_staff_name ? (
                        <span className="font-bold text-slate-100 flex items-center gap-1">
                          🔧 {c.assigned_staff_name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign Staff */}
                        <button
                          onClick={() => { setSelectedComplaint(c); setSelectedStaffId(c.assigned_staff_id || ''); setIsAssignOpen(true); }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold border border-purple-800/50 transition-colors text-[11px]"
                        >
                          Assign Staff
                        </button>

                        {/* Review Completion */}
                        {c.status === 'Waiting for Admin Verification' && (
                          <button
                            onClick={() => { setSelectedComplaint(c); setRejectionReason(''); setIsVerifyOpen(true); }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition-colors text-[11px] flex items-center gap-1 shadow-lg"
                          >
                            <Sparkles className="h-3 w-3" /> Review Work
                          </button>
                        )}

                        {/* Update Status */}
                        <button
                          onClick={() => { setSelectedComplaint(c); setStatusValue(c.status); setIsStatusOpen(true); }}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 font-bold border border-blue-800/50 transition-colors text-[11px]"
                        >
                          Update Status
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Page {page} of {totalPages} ({totalCount} total complaints)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Staff Assignment */}
      {isAssignOpen && selectedComplaint && (
        <Modal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          title={`Assign Staff — ${selectedComplaint.complaint_number || selectedComplaint.id}`}
        >
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 text-left text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold uppercase text-slate-400 text-[10px]">Select Maintenance Staff</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                required
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="">-- Choose Repair Technician --</option>
                {staffList.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name} ({s.department || 'General Maintenance'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold uppercase text-slate-400 text-[10px]">Admin Work Instructions</label>
              <textarea
                rows={3}
                value={assignRemarks}
                onChange={(e) => setAssignRemarks(e.target.value)}
                placeholder="e.g. Inspect 2nd floor router and replace faulty Ethernet jacks"
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {assignSubmitting ? 'Assigning...' : 'Confirm Assignment & Notify Staff'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Admin Verification (Approve / Reject Completed Work) */}
      {isVerifyOpen && selectedComplaint && (
        <Modal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          title={`Admin Work Verification — ${selectedComplaint.complaint_number || selectedComplaint.id}`}
        >
          <div className="flex flex-col gap-4 text-left text-xs">
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Completed by Staff</span>
              <h3 className="text-sm font-extrabold text-slate-100">{selectedComplaint.title}</h3>
              <p className="text-slate-400 font-medium">Technician: <strong className="text-slate-200">{selectedComplaint.assigned_staff_name || 'Staff'}</strong></p>
              <p className="text-slate-400 font-medium">Staff Remarks: <span className="text-slate-300 italic">"{selectedComplaint.staff_remarks || selectedComplaint.remarks || 'Work completed'}"</span></p>
              <p className="text-[10px] text-slate-500 font-bold">Completion Time: {selectedComplaint.completed_date ? new Date(selectedComplaint.completed_date).toLocaleString() : 'Just now'}</p>
            </div>

            {/* Before / After Photo Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Before Repair Photo</span>
                {selectedComplaint.before_image ? (
                  <img src={getMediaUrl(selectedComplaint.before_image)} alt="Before" className="h-32 w-full object-cover rounded-lg border border-slate-800" />
                ) : (
                  <div className="h-32 bg-slate-950 rounded-lg flex items-center justify-center text-[10px] text-slate-600 font-bold">No Image Provided</div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">After Repair Photo</span>
                {selectedComplaint.after_image ? (
                  <img src={getMediaUrl(selectedComplaint.after_image)} alt="After" className="h-32 w-full object-cover rounded-lg border border-slate-800" />
                ) : (
                  <div className="h-32 bg-slate-950 rounded-lg flex items-center justify-center text-[10px] text-slate-600 font-bold">No Image Provided</div>
                )}

              </div>
            </div>

            {/* Rejection Form Input */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-800">
              <label className="font-extrabold text-rose-400 text-[10px] uppercase">Rejection Reason (Mandatory if Rejecting)</label>
              <input
                type="text"
                placeholder="Explain why repair is incomplete or requires rework..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Verification Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                disabled={verifySubmitting}
                onClick={handleRejectWork}
                className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-extrabold border border-rose-500/40 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="h-4 w-4" /> Reject Completion (Reopen)
              </button>

              <button
                type="button"
                disabled={verifySubmitting}
                onClick={handleApproveWork}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
              >
                <Check className="h-4 w-4" /> Approve Completion (Resolve)
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* Modal: Status Update */}
      {isStatusOpen && selectedComplaint && (
        <Modal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          title={`Update Status — ${selectedComplaint.complaint_number || selectedComplaint.id}`}
        >
          <form onSubmit={handleStatusSubmit} className="flex flex-col gap-4 text-left text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold uppercase text-slate-400 text-[10px]">New Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                required
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Admin Verification">Waiting for Admin Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold uppercase text-slate-400 text-[10px]">Status Update Remarks</label>
              <textarea
                rows={3}
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="e.g. Work inspected by Admin"
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsStatusOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {statusSubmitting ? 'Updating...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Details & Timeline */}
      {isDetailsOpen && selectedComplaint && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Complaint Audit History — ${selectedComplaint.complaint_number || selectedComplaint.id}`}
        >
          <div className="flex flex-col gap-5 text-left text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-slate-100">{selectedComplaint.title}</h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadgeClass(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed font-semibold">{selectedComplaint.description}</p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-200 text-xs mb-3">Audit Timeline History</h4>
              <ComplaintTimeline complaintId={selectedComplaint.id || selectedComplaint._id} />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminComplaints;
