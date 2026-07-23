import React from 'react';
import StatusBadge from './StatusBadge';

const ComplaintTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-xs text-slate-400 dark:text-slate-500 italic">No timeline events logged.</p>;
  }

  // Format date helper
  const formatDate = (dateStr) => {
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
    <div className="flow-root py-2">
      <ul className="-mb-8">
        {timeline.map((event, idx) => {
          const isLast = idx === timeline.length - 1;

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                
                {/* Connecting Line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  
                  {/* Timeline bullet dot */}
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-8 ring-white dark:ring-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm">📍</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 py-1.5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={event.status} />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          by {event.updated_by_name}
                        </span>
                      </div>
                      <div className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {formatDate(event.updated_at)}
                      </div>
                    </div>

                    <div className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{event.remarks || 'No remarks provided.'}</p>
                    </div>

                  </div>

                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ComplaintTimeline;
