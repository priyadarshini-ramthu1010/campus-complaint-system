import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalCount, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
      
      {/* Label status */}
      <div className="text-xs sm:text-sm text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-700">{startIdx}</span> to{' '}
        <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalCount}</span> complaints
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 border border-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200"
          title="Previous Page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-xs sm:text-sm font-semibold text-slate-600 px-3">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 border border-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200"
          title="Next Page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
};

export default Pagination;
