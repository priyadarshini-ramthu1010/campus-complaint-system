import React from 'react';

const PriorityBadge = ({ priority }) => {
  const styles = {
    'Low': 'bg-slate-950 text-slate-200 border-slate-800',
    'Medium': 'bg-blue-100 text-blue-800 border-blue-200',
    'High': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Emergency': 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  };

  const currentStyle = styles[priority] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${currentStyle}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
