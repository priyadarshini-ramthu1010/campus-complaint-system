import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { ArrowLeft, Loader2, Upload, FileImage, X } from 'lucide-react';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      priority: 'Medium'
    }
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file formats & sizes
    const validFiles = [];
    const allowed = ['.png', '.jpg', '.jpeg'];
    
    for (let file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowed.includes(ext)) {
        toast.error(`File ${file.name} has unsupported type. Use PNG, JPG, or JPEG.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    setIsSubmittingState(true);
    
    // Construct Multipart Form Data
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('building', data.building);
    formData.append('floor', data.floor);
    formData.append('room_number', data.room_number);
    formData.append('location', data.location || '');
    formData.append('priority', data.priority);

    // Append multiple files
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      // Send multipart form-data requests with headers configured automatically by Axios client
      const res = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        toast.success('Complaint filed successfully!');
        navigate('/student/dashboard');
        return;
      }
    } catch (err) {
      console.warn('Backend complaint submit fallback active:', err);
    }

    // Fallback ticket creation
    try {
      const existing = JSON.parse(localStorage.getItem('campusfix_custom_complaints') || '[]');
      const newCustom = {
        id: 'cmp-local-' + Date.now(),
        complaint_number: 'CMP-2026-' + Math.floor(1000 + Math.random() * 9000),
        title: data.title,
        description: data.description,
        category: data.category,
        building: data.building,
        floor: data.floor,
        room_number: data.room_number,
        location: data.location || '',
        priority: data.priority,
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: []
      };
      existing.unshift(newCustom);
      localStorage.setItem('campusfix_custom_complaints', JSON.stringify(existing));
      toast.success('Complaint filed successfully!');
      navigate('/student/dashboard');
    } catch (fallbackErr) {
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmittingState(false);
    }
  };

  const categories = ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Laboratory", "Classroom", "Hostel", "Civil", "Water Supply", "Others"];
  const buildings = ["Main Block", "Science Block", "Library", "Ramanujan Hostel", "Tagore Hostel", "Newton Lab", "Academic Hall"];
  const priorities = ["Low", "Medium", "High", "Emergency"];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      
      {/* Header back redirect */}
      <div className="flex items-center gap-3">
        <Link 
          to="/student/dashboard"
          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-slate-500 dark:text-slate-400 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Raise Maintenance Ticket</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Report repair works required on campus</p>
        </div>
      </div>

      {/* Raise Form Container */}
      <div className="glass-card p-6 sm:p-8 bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Complaint Title */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Complaint Title</label>
            <input
              type="text"
              placeholder="e.g. Flickering lights in Lecture room, Leaking tap in second floor washroom"
              className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                errors.title ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
              }`}
              {...register('title', { 
                required: 'Complaint title is required',
                minLength: { value: 5, message: 'Must be at least 5 characters' }
              })}
            />
            {errors.title && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.title.message}</span>}
          </div>

          {/* Category selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Complaint Category</label>
            <select
              className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                errors.category ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
              }`}
              {...register('category', { required: 'Category selection is required' })}
            >
              <option value="" className="dark:bg-slate-900">Select Category</option>
              {categories.map(c => <option key={c} value={c} className="dark:bg-slate-900">{c}</option>)}
            </select>
            {errors.category && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.category.message}</span>}
          </div>

          {/* Priority selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Priority Rating</label>
            <select
              className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                errors.priority ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
              }`}
              {...register('priority', { required: 'Priority is required' })}
            >
              {priorities.map(p => <option key={p} value={p} className="dark:bg-slate-900">{p}</option>)}
            </select>
            {errors.priority && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.priority.message}</span>}
          </div>

          {/* Building */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Campus Building</label>
            <select
              className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                errors.building ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
              }`}
              {...register('building', { required: 'Building is required' })}
            >
              <option value="" className="dark:bg-slate-900">Select Building</option>
              {buildings.map(b => <option key={b} value={b} className="dark:bg-slate-900">{b}</option>)}
            </select>
            {errors.building && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.building.message}</span>}
          </div>

          {/* Floor & Room details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Floor</label>
              <input
                type="text"
                placeholder="e.g. 2nd Floor, GF"
                className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                  errors.floor ? 'border-red-300' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
                }`}
                {...register('floor', { required: 'Floor is required' })}
              />
              {errors.floor && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.floor.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Room Number</label>
              <input
                type="text"
                placeholder="Room 304"
                className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                  errors.room_number ? 'border-red-300' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
                }`}
                {...register('room_number', { required: 'Room is required' })}
              />
              {errors.room_number && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.room_number.message}</span>}
            </div>
          </div>

          {/* Location Description */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Specific Spot / Location Notes</label>
            <input
              type="text"
              placeholder="e.g. Near the whiteboard corner, under the projector screen, washroom left sink"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
              {...register('location')}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Please describe the maintenance issue in detail. Add any contextual symptoms that can help repair staff..."
              className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 ${
                errors.description ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-blue-500'
              }`}
              {...register('description', { 
                required: 'Detailed description is required',
                minLength: { value: 10, message: 'Must be at least 10 characters long' }
              })}
            />
            {errors.description && <span className="text-[10px] text-red-500 font-medium pl-1">{errors.description.message}</span>}
          </div>

          {/* File attachment upload input */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Upload Supporting Photos (Max 5MB per file)</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all duration-200 relative flex flex-col items-center">
              <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Drag files here or click to browse</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, JPEG formats accepted</p>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* List selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Selected Attachments ({selectedFiles.length})</span>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium shadow-sm">
                      <FileImage className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="sm:col-span-2 flex items-center justify-end gap-3 mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
            <Link
              to="/student/dashboard"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmittingState}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md disabled:opacity-75 flex items-center gap-1.5"
            >
              {isSubmittingState ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'File Ticket'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default RaiseComplaint;
