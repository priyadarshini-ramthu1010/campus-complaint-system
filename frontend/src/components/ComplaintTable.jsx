import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, UserCheck, PlayCircle, ImageIcon } from 'lucide-react';

const ComplaintTable = ({ complaints, role, onViewDetails, onAssignStaff, onUpdateStatus }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl text-center shadow-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
        <span className="text-4xl">📁</span>
        <h4 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">No complaints found</h4>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 max-w-xs">There are no records matching your criteria or search inputs.</p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl overflow-hidden shadow-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          
          {/* Table Header */}
          <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Title / Category</th>
              {role === 'admin' && <th className="px-6 py-4">Raised By</th>}
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned Staff</th>
              <th className="px-6 py-4">Photo</th>
              <th className="px-6 py-4">Submitted Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {complaints.map((comp) => {
              const hasPhoto = comp.images && comp.images.length > 0;
              const photoUrl = hasPhoto ? `http://127.0.0.1:8000/media/${comp.images[0].image_path}` : null;

              return (
                <tr key={comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors duration-150">
                  
                  {/* Ticket Number */}
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {comp.complaint_number}
                  </td>
                  
                  {/* Title & Category */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{comp.title}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{comp.category}</span>
                    </div>
                  </td>
                  
                  {/* Student Info (Admin only) */}
                  {role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.student_name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{comp.roll_number}</span>
                      </div>
                    </td>
                  )}
                  
                  {/* Location */}
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col">
                      <span>{comp.building}</span>
                      <span className="text-slate-400 dark:text-slate-500">{comp.floor}, Room {comp.room_number}</span>
                    </div>
                  </td>
                  
                  {/* Priority */}
                  <td className="px-6 py-4">
                    <PriorityBadge priority={comp.priority} />
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={comp.status} />
                  </td>
                  
                  {/* Assigned Staff */}
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {comp.assigned_staff_name ? (
                      <span className="text-slate-700 dark:text-slate-200">🔧 {comp.assigned_staff_name}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic font-normal">Unassigned</span>
                    )}
                  </td>

                  {/* Photo Preview Icon */}
                  <td className="px-6 py-4">
                    {hasPhoto ? (
                      <a 
                        href={photoUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 dark:bg-blue-900/30 text-primary dark:text-blue-400 border border-primary/10 dark:border-blue-800/40 hover:bg-primary dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all duration-200"
                        title="View attachment"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    {formatDate(comp.created_at)}
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* View Details */}
                      <button
                        onClick={() => onViewDetails(comp.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200"
                        title="View Timeline & Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Admin: Assign Staff */}
                      {role === 'admin' && (
                        <button
                          onClick={() => onAssignStaff(comp)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-900/30 hover:text-primary-dark dark:hover:text-blue-300 transition-all duration-200"
                          title="Assign Staff"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}

                      {/* Staff/Admin: Update Status */}
                      {(role === 'staff' || (role === 'admin' && comp.status !== 'Resolved')) && (
                        <button
                          onClick={() => onUpdateStatus(comp)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-all duration-200"
                          title="Update Status / Action"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;
