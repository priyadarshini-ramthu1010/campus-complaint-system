import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Users, UserPlus, Phone, Mail, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import Loader from '../../components/Loader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      
      const res = await api.get('/users', { params });
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRegisterStaff = async (data) => {
    setRegisterLoading(true);
    try {
      const res = await api.post('/users/staff', data);
      if (res.success) {
        toast.success('Maintenance staff registered successfully!');
        reset();
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register staff');
    } finally {
      setRegisterLoading(false);
    }
  };

  const departments = [
    'Electrical Maintenance',
    'Plumbing Maintenance',
    'Network Support',
    'Furniture & Carpentry',
    'Sanitation & Cleaning',
    'General Works'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* List users layout */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 glass-card p-5 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Users className="h-5 w-5 text-primary" /> Active Users directory
            </h2>
            <p className="text-xs text-slate-400 font-semibold">Listing enrolled students and maintenance staff</p>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        {/* Directory grid list */}
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    <span className="text-xs text-slate-400 font-semibold truncate">{item.email}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    item.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    item.role === 'staff' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {item.role}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-50 pt-3 text-xs text-slate-500 space-y-1">
                  {item.role === 'student' ? (
                    <>
                      <p><span className="font-semibold text-slate-400">Roll:</span> {item.roll_number}</p>
                      <p><span className="font-semibold text-slate-400">Dept:</span> {item.department} | Year: {item.year}</p>
                    </>
                  ) : (
                    <p><span className="font-semibold text-slate-400">Dept:</span> {item.department}</p>
                  )}
                  <p><span className="font-semibold text-slate-400">Phone:</span> {item.phone || 'N/A'}</p>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="sm:col-span-2 text-center py-12 glass-card rounded-2xl text-slate-400 text-sm">
                No users found.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Staff registration panel */}
      <div className="flex flex-col gap-4">
        
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <UserPlus className="h-5 w-5 text-success" /> Register Staff
            </h2>
            <p className="text-xs text-slate-400 font-semibold">Create user profiles for repair technicians</p>
          </div>

          <form onSubmit={handleSubmit(handleRegisterStaff)} className="flex flex-col gap-3.5">
            
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Technician Name</label>
              <input
                type="text"
                placeholder="e.g. John Electrical"
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all ${
                  errors.name ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                placeholder="repair@campus.com"
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all ${
                  errors.email ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[\w\.\+-]+@[\w\.-]+\.\w+$/, message: 'Invalid format' }
                })}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Create Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all ${
                  errors.password ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 chars' }
                })}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="10 digit number"
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all ${
                  errors.phone ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' }
                })}
              />
            </div>

            {/* Department selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Maintenance Department</label>
              <select
                className={`w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all ${
                  errors.department ? 'border-red-300' : 'border-slate-200'
                }`}
                {...register('department', { required: 'Department is required' })}
              >
                <option value="">Select Dept</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-success text-white hover:bg-success-dark font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 mt-2 disabled:opacity-75"
            >
              {registerLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                'Register Staff'
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default UserManagement;
