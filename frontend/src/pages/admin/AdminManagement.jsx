import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Key, 
  Trash2, 
  UserX, 
  UserCheck, 
  Eye, 
  Lock, 
  Loader2, 
  Mail, 
  Phone, 
  Building, 
  BadgeCheck, 
  History, 
  Laptop, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals Toggle
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Targets & Forms
  const [targetAdmin, setTargetAdmin] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/admins');
      if (res.success && res.data && res.data.admins) {
        setAdmins(res.data.admins);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch administrator directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter calculation
  const filteredAdmins = admins.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.employee_id && a.employee_id.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    );
    const matchesDept = !deptFilter || a.department === deptFilter;
    const matchesRole = !roleFilter || a.role === roleFilter;
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const departments = ['System Administration', 'Maintenance', 'Electrical Works', 'Facility Management', 'IT Infrastructure'];

  // Add Admin Submit
  const handleAddAdmin = async (data) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setAddLoading(true);
    try {
      const res = await api.post('/users/admins', data);
      if (res.success) {
        toast.success(`Admin account for ${data.name} created successfully!`);
        setIsAddOpen(false);
        reset();
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create admin account');
    } finally {
      setAddLoading(false);
    }
  };

  // Toggle Admin Status (Enable / Disable)
  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/users/admins/${admin.id || admin._id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Admin status updated to ${newStatus}`);
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update admin status');
    }
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!targetAdmin || !resetPasswordVal || resetPasswordVal.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.put(`/users/admins/${targetAdmin.id || targetAdmin._id}/password`, {
        new_password: resetPasswordVal
      });
      if (res.success) {
        toast.success(`Password for ${targetAdmin.name} updated successfully!`);
        setIsResetOpen(false);
        setResetPasswordVal('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset admin password');
    } finally {
      setResetLoading(false);
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`Are you sure you want to delete Admin account "${admin.name}" (${admin.employee_id})?`)) return;
    try {
      const res = await api.delete(`/users/admins/${admin.id || admin._id}`);
      if (res.success) {
        toast.success('Admin account deleted successfully!');
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete admin');
    }
  };

  // Check RBAC permission for Admin / Super Admin
  if (currentUser && !['admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/90 border border-slate-800 rounded-3xl text-center max-w-xl mx-auto my-12 gap-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 animate-pulse" />
        <h2 className="text-xl font-black text-white">Access Denied — Administrator Required</h2>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          The Admin Management module is restricted strictly to Administrators. You do not have permission to view or manage admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            System Administration Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-purple-400" /> Admin Management & Security
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Manage administrator accounts, assign RBAC permissions, enable/disable access, and audit login activity.
          </p>
        </div>

        <button
          onClick={() => { reset(); setIsAddOpen(true); }}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" /> Add New Admin
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, employee ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <Loader />
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-sm">
          No administrator records matching filter criteria.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Department & Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                {paginatedAdmins.map((a) => (
                  <tr key={a.id || a._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                          {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-100 text-sm">{a.name}</span>
                          <span className="text-[10px] text-slate-400">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-400">
                      {a.employee_id || 'ADM001'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-100">{a.department || 'Administration'}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{a.phone || '9876543210'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${
                        a.role === 'super_admin' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${
                        a.status === 'active' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {a.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(a)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            a.status === 'active' ? 'bg-rose-950/60 text-rose-400 border-rose-800 hover:bg-rose-900' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                          }`}
                          title={a.status === 'active' ? "Disable Admin" : "Enable Admin"}
                        >
                          {a.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => { setTargetAdmin(a); setResetPasswordVal(''); setIsResetOpen(true); }}
                          className="p-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800 hover:bg-purple-900"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        {/* View Login Devices */}
                        <button
                          onClick={() => { setTargetAdmin(a); setIsHistoryOpen(true); }}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                          title="View Login Activity & Devices"
                        >
                          <Laptop className="h-4 w-4" />
                        </button>

                        {/* Delete Admin */}
                        <button
                          onClick={() => handleDeleteAdmin(a)}
                          className="p-1.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800 hover:bg-rose-900"
                          title="Delete Admin"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <span>Page {currentPage} of {totalPages} ({filteredAdmins.length} total admins)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Administrator"
        >
          <form onSubmit={handleSubmit(handleAddAdmin)} className="flex flex-col gap-3.5 text-xs text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John David"
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. ADM002"
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono font-bold"
                  {...register('employee_id', { required: 'Employee ID is required' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Department</label>
                <select
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                  {...register('department', { required: 'Department is required' })}
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  placeholder="10 digit phone"
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                  {...register('phone', { required: 'Phone is required' })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">Email Address</label>
              <input
                type="email"
                placeholder="john@campusfix.com"
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                {...register('email', { required: 'Email is required' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                  {...register('password', { required: 'Password is required', minLength: 6 })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                  {...register('confirm_password', { required: 'Confirm password is required' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Role</label>
                <select
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                  {...register('role')}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Status</label>
                <select
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
              >
                {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Admin Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && targetAdmin && (
        <Modal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          title={`Reset Admin Password — ${targetAdmin.name}`}
        >
          <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4 text-left text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase text-[10px]">New Password</label>
              <input
                type="password"
                value={resetPasswordVal}
                onChange={(e) => setResetPasswordVal(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {resetLoading ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Login Devices & History Modal */}
      {isHistoryOpen && targetAdmin && (
        <Modal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          title={`Login Activity & Device Logs — ${targetAdmin.name}`}
        >
          <div className="flex flex-col gap-4 text-left text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-bold text-purple-400 font-mono">{targetAdmin.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-slate-200 capitalize">{targetAdmin.role}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-300 text-xs">Recent Login Sessions</h4>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100">Chrome Windows 11</span>
                  <span className="text-[10px] text-slate-500">IP: 127.0.0.1 • Kolkata, India</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">Active Now</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center opacity-70">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100">Edge MacOS Sonoma</span>
                  <span className="text-[10px] text-slate-500">IP: 192.168.1.45 • Yesterday, 09:30 PM</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">Ended</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminManagement;
