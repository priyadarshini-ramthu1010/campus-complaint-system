import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Wrench, UserPlus, Phone, Mail, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import Loader from '../../components/Loader';

const AdminStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { role: 'staff' } });
      if (res.success && res.data && res.data.users) {
        setStaffList(res.data.users);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRegisterStaff = async (data) => {
    setRegisterLoading(true);
    try {
      const res = await api.post('/users/staff', data);
      if (res.success) {
        toast.success('Maintenance technician registered successfully!');
        reset();
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register technician');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Staff directory */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Campus Technicians
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-purple-400" /> Maintenance Staff Directory
            </h1>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Active repairmen available for complaint assignment and facility management.
            </p>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <Loader />
        ) : staffList.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-sm">
            No maintenance staff registered yet. Use the form to register repair technicians.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffList.map((s) => (
              <div key={s.id || s._id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between hover:border-purple-800/50 transition-colors shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                      {s.name ? s.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-100 text-sm">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{s.email}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-950 text-purple-400 border border-purple-800">
                    Staff
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1">
                  <p><span className="font-semibold text-slate-500">Dept:</span> <strong className="text-slate-200">{s.department || 'General Maintenance'}</strong></p>
                  <p><span className="font-semibold text-slate-500">Phone:</span> <strong className="text-slate-200">{s.phone || 'N/A'}</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Staff Registration Panel */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col gap-5">
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-400" /> Register Technician
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Create user profiles for maintenance staff</p>
          </div>

          <form onSubmit={handleSubmit(handleRegisterStaff)} className="flex flex-col gap-3.5 text-xs">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Technician Name</label>
              <input
                type="text"
                placeholder="e.g. John Electrician"
                className={`w-full rounded-2xl border bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold ${
                  errors.name ? 'border-red-400' : 'border-slate-800'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                placeholder="repairman@campus.com"
                className={`w-full rounded-2xl border bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold ${
                  errors.email ? 'border-red-400' : 'border-slate-800'
                }`}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[\w\.\+-]+@[\w\.-]+\.\w+$/, message: 'Invalid email' }
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className={`w-full rounded-2xl border bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold ${
                  errors.password ? 'border-red-400' : 'border-slate-800'
                }`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 chars' }
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="10 digit phone number"
                className={`w-full rounded-2xl border bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold ${
                  errors.phone ? 'border-red-400' : 'border-slate-800'
                }`}
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' }
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Specialization Department</label>
              <select
                className={`w-full rounded-2xl border bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-bold ${
                  errors.department ? 'border-red-400' : 'border-slate-800'
                }`}
                {...register('department', { required: 'Department is required' })}
              >
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-75"
            >
              {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Technician'}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminStaff;
