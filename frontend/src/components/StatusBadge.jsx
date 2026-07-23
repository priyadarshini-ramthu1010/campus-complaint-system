import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Assigned': 'bg-slate-950 text-white border-slate-800',
    'In Progress': 'bg-pink-100 text-pink-700 border-pink-200',
    'Resolved': 'bg-blue-100 text-blue-700 border-blue-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse-subtle"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
