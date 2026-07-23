import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardCards from '../../components/DashboardCards';
import ComplaintTable from '../../components/ComplaintTable';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Search, Filter, PlayCircle, Loader2, Upload, FileImage, X, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  
  // Lists & Stats
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals Toggle
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Detail Complaint
  const [detailComplaint, setDetailComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Update Status Form
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [statusValue, setStatusValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [resolutionFiles, setResolutionFiles] = useState([]);

  const fetchStats = async () => {
    try {
      // Query staff assigned list (without limit) to count
      const res = await api.get('/complaints', { params: { limit: 1000 } });
      if (res.success) {
        const list = res.data.complaints;
        const assigned = list.filter(c => c.status === 'Assigned').length;
        const in_progress = list.filter(c => c.status === 'In Progress').length;
        const completed = list.filter(c => c.status === 'Resolved').length;
        setStats({ assigned, in_progress, completed });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: searchVal,
        status: statusFilter,
        priority: priorityFilter
      };

      const res = await api.get('/complaints', { params });
      if (res.success) {
        setComplaints(res.data.complaints);
        setTotalCount(res.data.pagination.total_count);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, searchVal, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchVal(searchTerm);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchVal('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const handleCardClick = (status) => {
    setStatusFilter(status);
    setPage(1);
    const element = document.getElementById('staff-list-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDetails = async (id) => {
    setIsDetailsOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.success) {
        setDetailComplaint(res.data.complaint);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch details');
      setIsDetailsOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenUpdate = (comp) => {
    setTargetComplaint(comp);
    setStatusValue(comp.status === 'Assigned' ? 'In Progress' : comp.status);
    setRemarks('');
    setResolutionFiles([]);
    setIsUpdateOpen(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const allowed = ['.png', '.jpg', '.jpeg'];
    
    for (let file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowed.includes(ext)) {
        toast.error(`File ${file.name} type not supported. Use PNG, JPG, or JPEG.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }
    
    setResolutionFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (idx) => {
    setResolutionFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.strip()) {
      toast.error('Audit update remarks are required');
      return;
    }

    setUpdateSubmitting(true);
    
    // Construct Form Data
    const formData = new FormData();
    formData.append('status', statusValue);
    formData.append('remarks', remarks.trim() || `Work status updated to ${statusValue}`);

    resolutionFiles.forEach((file) => {
      formData.append('resolution_images', file);
    });

    try {
      const res = await api.put(`/complaints/${targetComplaint.id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        toast.success(`Complaint updated to: ${statusValue}`);
        setIsUpdateOpen(false);
        fetchComplaints();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Technician Dashboard</h1>
        <p className="text-xs text-slate-400 font-semibold">View work orders assigned to you and update maintenance milestones</p>
      </div>

      {/* Stats Widgets */}
      <DashboardCards stats={stats} role="staff" onCardClick={handleCardClick} activeStatus={statusFilter} />

      {/* Search and Filters */}
      <div id="staff-list-section" className="glass-card p-5 flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by ticket no, category, spot, building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200"
          >
            Search
          </button>
          {(searchVal || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              Reset
            </button>
          )}
        </form>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-55 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Grid list table */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <ComplaintTable 
            complaints={complaints}
            role="staff"
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleOpenUpdate}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={10}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Work update modal */}
      <Modal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} title="Update Task Status">
        {targetComplaint && (
          <form onSubmit={handleUpdateStatusSubmit} className="flex flex-col gap-4">
            
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Task order</span>
              <p className="text-sm font-semibold text-slate-700">{targetComplaint.complaint_number} - {targetComplaint.title}</p>
              <p className="text-xs text-slate-500 mt-1">Location: <span className="font-semibold">{targetComplaint.building}, Floor {targetComplaint.floor}, Room {targetComplaint.room_number}</span></p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Update Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                required
              >
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Mark Resolved</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Work Remarks / Resolution Notes</label>
              <textarea
                rows={3}
                placeholder="Explain the work done, parts replaced, or ongoing repair diagnostics..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Optional resolution image upload */}
            {statusValue === 'Resolved' && (
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload Resolution Photo (Optional)</label>
                <div className="border border-dashed border-slate-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer relative flex flex-col items-center">
                  <Upload className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold">Attach resolution proof image</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {resolutionFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {resolutionFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] text-slate-600 font-medium">
                        <FileImage className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <button type="button" onClick={() => handleRemoveFile(i)} className="text-slate-400 hover:text-rose-600 ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={updateSubmitting}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {updateSubmitting ? 'Saving...' : 'Save Updates'}
            </button>

          </form>
        )}
      </Modal>

      {/* Details Timeline Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={detailComplaint ? `Task: ${detailComplaint.complaint_number}` : 'Loading...'}
      >
        {detailLoading || !detailComplaint ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Core details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter Student</span>
                <p className="text-sm font-semibold text-slate-700">{detailComplaint.student_name}</p>
                <p className="text-[10px] text-slate-400">Dept: {detailComplaint.department} | Roll: {detailComplaint.roll_number}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category / Priority</span>
                <p className="text-sm font-semibold text-slate-700">{detailComplaint.category} ({detailComplaint.priority})</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title / Job Description</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{detailComplaint.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{detailComplaint.description}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location SPOT</span>
                <p className="text-xs text-slate-700 font-semibold">{detailComplaint.building}, Floor {detailComplaint.floor}, Room {detailComplaint.room_number}</p>
                {detailComplaint.location && <p className="text-[10px] text-slate-400">Reference: {detailComplaint.location}</p>}
              </div>
            </div>

            {/* Images */}
            {detailComplaint.images && detailComplaint.images.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task attachments</h4>
                <div className="flex flex-wrap gap-3">
                  {detailComplaint.images.map((img, i) => (
                    <a 
                      key={i}
                      href={`http://127.0.0.1:8000/media/${img.image_path}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="border border-slate-200 rounded-xl overflow-hidden hover:opacity-85"
                    >
                      <img 
                        src={`http://127.0.0.1:8000/media/${img.image_path}`} 
                        alt="attachment" 
                        className="h-16 w-16 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Status Timeline Log</h4>
              <ComplaintTimeline timeline={detailComplaint.timeline} />
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default StaffDashboard;
