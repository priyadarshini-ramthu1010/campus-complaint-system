import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { Star, MessageSquare, Ticket, FileText } from 'lucide-react';

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      if (res.success) {
        setFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve feedback records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Student Feedback Logs
        </h1>
        <p className="text-xs text-slate-400 font-semibold">Review ratings and remarks submitted by students for resolved maintenance tickets</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* Top Row: Ticket and Rating */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" /> {fb.complaint_number}
                  </span>
                  <span className="text-xs text-slate-700 font-bold mt-1 line-clamp-1">
                    {fb.complaint_title}
                  </span>
                </div>
                
                {/* Visual Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4.5 w-4.5 ${i < fb.rating ? 'fill-current' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mt-4 bg-white/40 border border-white/20 p-4 rounded-xl">
                <p className="text-sm font-semibold text-slate-600 italic">
                  "{fb.comment || 'No review comments left.'}"
                </p>
              </div>

              {/* Bottom details */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-semibold uppercase">
                <span>Submitted By: {fb.student_name}</span>
                <span>{new Date(fb.created_at).toLocaleDateString('en-IN')}</span>
              </div>

            </div>
          ))}

          {feedbacks.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 glass-card rounded-2xl text-slate-400 text-sm">
              No feedback records logged yet.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ViewFeedback;
