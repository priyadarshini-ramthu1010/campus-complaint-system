import React, { useState, useEffect } from 'react';
import DashboardCards from '../../components/DashboardCards';
import ComplaintTable from '../../components/ComplaintTable';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  UserCheck, 
  PlayCircle, 
  Star, 
  Sparkles, 
  PieChart as PieIcon,
  BarChart as BarIcon,
  MessageSquare,
  Building,
  GraduationCap,
  UserPlus,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const AdminDashboard = () => {
  // Lists & Stats States
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Dropdowns for assignments
  const [staffList, setStaffList] = useState([]);
  
  // Modals Toggle
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Add Admin modal state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmployeeId, setAdminEmployeeId] = useState('');
  const [adminDept, setAdminDept] = useState('System Administration');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPw, setAdminConfirmPw] = useState('');
  const [adminRole, setAdminRole] = useState('admin');
  const [adminStatus, setAdminStatus] = useState('active');
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  // Target IDs & Forms State
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [statusValue, setStatusValue] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [detailComplaint, setDetailComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Colors for charts
  const COLORS = ['#1E3A8A', '#EC4899', '#EAB308', '#EF4444', '#3B82F6', '#F472B6', '#CA8A04', '#DC2626'];

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to aggregate dashboard metrics');
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
        priority: priorityFilter,
        category: categoryFilter,
        building: buildingFilter,
        department: deptFilter
      };

      const res = await api.get('/complaints', { params });
      if (res.success) {
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, searchVal, statusFilter, priorityFilter, categoryFilter, buildingFilter, deptFilter]);

  // Submit Add Admin
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (adminPassword !== adminConfirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    setAddAdminLoading(true);
    try {
      const res = await api.post('/users/admins', {
        name: adminName,
        employee_id: adminEmployeeId,
        department: adminDept,
        phone: adminPhone,
        email: adminEmail,
        password: adminPassword,
        confirm_password: adminConfirmPw,
        role: adminRole,
        status: adminStatus,
      });
      if (res.success) {
        toast.success(`Admin account for ${adminName} created successfully!`);
        setIsAddAdminOpen(false);
        setAdminName('');
        setAdminEmployeeId('');
        setAdminPhone('');
        setAdminEmail('');
        setAdminPassword('');
        setAdminConfirmPw('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create admin account');
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Submit search query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchVal(searchTerm);
    setPage(1);
  };

  // Reset filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchVal('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setBuildingFilter('');
    setDeptFilter('');
    setPage(1);
  };

  // Open assign modal
  const handleOpenAssign = (comp) => {
    setTargetComplaint(comp);
    setSelectedStaffId(comp.assigned_staff_id || '');
    setAssignRemarks('');
    setIsAssignOpen(true);
  };

  // Submit assign staff API
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error('Please select a staff member to assign');
      return;
    }

    setAssignSubmitting(true);
    try {
      const res = await api.put(`/complaints/${targetComplaint.id}/assign`, {
        staff_id: selectedStaffId,
        remarks: assignRemarks
      });

      if (res.success) {
        toast.success('Technician assigned successfully');
        setIsAssignOpen(false);
        fetchComplaints();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to assign technician');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Open update status trigger
  const handleOpenStatus = (comp) => {
    setTargetComplaint(comp);
    setStatusValue(comp.status);
    setStatusRemarks('');
    setIsStatusOpen(true);
  };

  // Submit update status API
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusSubmitting(true);
    try {
      const res = await api.put(`/complaints/${targetComplaint.id}/status`, {
        status: statusValue,
        remarks: statusRemarks.trim() || `Status updated to ${statusValue}`
      });

      if (res.success) {
        toast.success('Complaint status updated successfully');
        setIsStatusOpen(false);
        fetchComplaints();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleCardClick = (status) => {
    if (status === 'today') return;
    setStatusFilter(status);
    setPage(1);
    const element = document.getElementById('complaint-list-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Prepare chart data format
  const getPieData = (dataObj) => {
    if (!dataObj) return [];
    return Object.keys(dataObj).map(key => ({
      name: key,
      value: dataObj[key]
    }));
  };

  const categories = ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Laboratory", "Classroom", "Hostel", "Civil", "Water Supply", "Others"];
  const buildings = ["Lakshmi Block", "Saraswathi Block", "Srivasa Block", "Shiva Block", "NPN Block", "Industrial Block", "KK Block", "Vinayaka Block", "Annapurna Block", "Research Block"];

  const departments = ["System Administration", "Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Chemical"];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-400 font-semibold">Oversee campus complaints, review staff assignments, and monitor SLA progress</p>
        </div>
        
        <button
          onClick={() => setIsAddAdminOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" /> Add New Admin
        </button>
      </div>

      {/* Stats widget row */}
      {stats && <DashboardCards stats={stats.cards} role="admin" onCardClick={handleCardClick} activeStatus={statusFilter} />}

      {/* Visual Analytics row using Recharts */}
      {stats && stats.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Complaints by Category Chart */}
          <div className="glass-card p-5 flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <PieIcon className="h-4 w-4 text-primary" /> Complaints by Category
            </span>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData(stats.charts.by_category)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getPieData(stats.charts.by_category).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Complaints by Status Chart */}
          <div className="glass-card p-5 flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <BarIcon className="h-4 w-4 text-success" /> Complaints by Status
            </span>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPieData(stats.charts.by_status)}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} width={15} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1E3A8A" radius={[4, 4, 0, 0]}>
                    {getPieData(stats.charts.by_status).map((entry, index) => {
                      const colorMap = {
                        'Pending': '#EAB308',
                        'Assigned': '#3B82F6',
                        'In Progress': '#A855F7',
                        'Resolved': '#10B981',
                        'Rejected': '#EF4444'
                      };
                      return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#1E3A8A'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Complaints Priority Chart */}
          <div className="glass-card p-5 flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Star className="h-4 w-4 text-warning" /> Priority Distribution
            </span>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData(stats.charts.by_priority)}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                  >
                    {getPieData(stats.charts.by_priority).map((entry, index) => {
                      const priorityColorMap = {
                        'Low': '#10B981',
                        'Medium': '#EAB308',
                        'High': '#F97316',
                        'Emergency': '#EF4444'
                      };
                      return <Cell key={`cell-${index}`} fill={priorityColorMap[entry.name] || '#64748B'} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6-Month Volume Trend */}
          <div className="glass-card p-5 flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <PlayCircle className="h-4 w-4 text-primary" /> Monthly Complaint Trends
            </span>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.monthly || []}>
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} width={15} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1E3A8A" fill="#3B82F6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Main Table View Section */}
      <div id="complaint-list-section" className="glass-card p-6 flex flex-col gap-5">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search ticket ID, student name, roll number, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-all text-slate-800 dark:text-slate-100"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all"
              >
                Search
              </button>
              {(searchVal || statusFilter || priorityFilter || categoryFilter || buildingFilter || deptFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </form>

          {/* Inline Dropdown Select Filters */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-left">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={buildingFilter}
              onChange={(e) => { setBuildingFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-primary"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <Loader />
        ) : (
          <ComplaintTable
            complaints={complaints}
            onOpenAssign={handleOpenAssign}
            onOpenStatus={handleOpenStatus}
            onViewDetails={(comp) => { setDetailComplaint(comp); setIsDetailsOpen(true); }}
            role="admin"
          />
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign Staff Technician — ${targetComplaint?.complaint_number}`}
      >
        <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-extrabold uppercase text-slate-500">Select Technician</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Repairman --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department || 'General Maintenance'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="font-extrabold uppercase text-slate-500">Work Order Remarks</label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Please inspect 2nd floor router and replace faulty cable"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition-all"
            >
              {assignSubmitting ? 'Assigning...' : 'Confirm Staff Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        title={`Update Complaint Status — ${targetComplaint?.complaint_number}`}
      >
        <form onSubmit={handleStatusSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-extrabold uppercase text-slate-500">New Status</label>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              required
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-primary"
            >
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="font-extrabold uppercase text-slate-500">Status Update Remarks</label>
            <textarea
              rows={3}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="e.g. Work started by technician team"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsStatusOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition-all"
            >
              {statusSubmitting ? 'Updating...' : 'Save Status Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Detail & Audit Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Ticket Audit History — ${detailComplaint?.complaint_number}`}
      >
        {detailComplaint && (
          <div className="flex flex-col gap-5 text-left">
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-extrabold text-slate-800">{detailComplaint.title}</h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {detailComplaint.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{detailComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Student</span>
                <span className="font-bold text-slate-800">{detailComplaint.student_name}</span>
                <span className="block text-[10px] text-slate-400">{detailComplaint.roll_number} • {detailComplaint.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                <span className="font-bold text-slate-800">{detailComplaint.building}</span>
                <span className="block text-[10px] text-slate-400">Floor {detailComplaint.floor}, Room {detailComplaint.room_number}</span>
              </div>
            </div>

            {/* Timelines list */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Status Timeline Log</h4>
              <ComplaintTimeline timeline={detailComplaint.timeline} />
            </div>

            {/* Feedback display */}
            {detailComplaint.feedback && (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 text-amber-400 fill-current" /> Student Feedback Rating
                </h4>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < detailComplaint.feedback.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} 
                    />
                  ))}
                  <span className="text-xs text-slate-500 font-semibold ml-1">({detailComplaint.feedback.rating}/5)</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 italic">"{detailComplaint.feedback.comment}"</p>
                <p className="text-[10px] text-slate-400 mt-1">Submitted on: {new Date(detailComplaint.feedback.created_at).toLocaleString('en-IN')}</p>
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* Add Admin Modal */}
      {isAddAdminOpen && (
        <Modal
          isOpen={isAddAdminOpen}
          onClose={() => setIsAddAdminOpen(false)}
          title="Add New Administrator"
        >
          <form onSubmit={handleAddAdminSubmit} className="flex flex-col gap-3.5 text-xs text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John David"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. ADM002"
                  value={adminEmployeeId}
                  onChange={(e) => setAdminEmployeeId(e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Department</label>
                <select
                  value={adminDept}
                  onChange={(e) => setAdminDept(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  placeholder="10 digit phone"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">Email Address</label>
              <input
                type="email"
                placeholder="john@campusfix.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={adminConfirmPw}
                  onChange={(e) => setAdminConfirmPw(e.target.value)}
                  required
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Role</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Status</label>
                <select
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addAdminLoading}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
              >
                {addAdminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Admin Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminDashboard;
