import React from 'react';
import { 
  FileText, 
  AlertCircle, 
  Hourglass, 
  CheckCircle2, 
  UserCheck, 
  CalendarDays,
  XCircle
} from 'lucide-react';

const DashboardCards = ({ stats, role, onCardClick, activeStatus }) => {
  if (!stats) return null;

  const cardConfig = {
    student: [
      { 
        label: 'Total Complaints', 
        value: stats.total || 0, 
        icon: FileText, 
        iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100/50 dark:border-blue-800/40',
        status: '' 
      },
      { 
        label: 'Pending Tickets', 
        value: stats.pending || 0, 
        icon: AlertCircle, 
        iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-100/50 dark:border-orange-800/40',
        status: 'Pending' 
      },
      { 
        label: 'In Progress', 
        value: stats.in_progress || 0, 
        icon: Hourglass, 
        iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100/50 dark:border-purple-800/40',
        status: 'In Progress' 
      },
      { 
        label: 'Resolved Tickets', 
        value: stats.resolved || 0, 
        icon: CheckCircle2, 
        iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100/50 dark:border-emerald-800/40',
        status: 'Resolved' 
      },
    ],
    admin: [
      { 
        label: 'Total Complaints', 
        value: stats.total || 0, 
        icon: FileText, 
        iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100/50 dark:border-blue-800/40',
        status: '' 
      },
      { 
        label: 'Pending', 
        value: stats.pending || 0, 
        icon: AlertCircle, 
        iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-100/50 dark:border-orange-800/40',
        status: 'Pending' 
      },
      { 
        label: 'Assigned', 
        value: stats.assigned || 0, 
        icon: UserCheck, 
        iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-100/50 dark:border-sky-800/40',
        status: 'Assigned' 
      },
      { 
        label: 'In Progress', 
        value: stats.in_progress || 0, 
        icon: Hourglass, 
        iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100/50 dark:border-purple-800/40',
        status: 'In Progress' 
      },
      { 
        label: 'Resolved', 
        value: stats.resolved || 0, 
        icon: CheckCircle2, 
        iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100/50 dark:border-emerald-800/40',
        status: 'Resolved' 
      },
      { 
        label: 'Rejected', 
        value: stats.rejected || 0, 
        icon: XCircle, 
        iconColor: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-100/50 dark:border-red-800/40',
        status: 'Rejected' 
      },
      { 
        label: "Today's Tickets", 
        value: stats.today || 0, 
        icon: CalendarDays, 
        iconColor: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 border-pink-100/50 dark:border-pink-800/40',
        status: 'today' 
      },
    ],
    staff: [
      { 
        label: 'Assigned Tasks', 
        value: stats.assigned || 0, 
        icon: UserCheck, 
        iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-100/50 dark:border-sky-800/40',
        status: 'Assigned' 
      },
      { 
        label: 'In Progress', 
        value: stats.in_progress || 0, 
        icon: Hourglass, 
        iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100/50 dark:border-purple-800/40',
        status: 'In Progress' 
      },
      { 
        label: 'Completed Tasks', 
        value: stats.completed || 0, 
        icon: CheckCircle2, 
        iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100/50 dark:border-emerald-800/40',
        status: 'Resolved' 
      },
    ]
  };

  const currentCards = cardConfig[role] || [];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {currentCards.map((card, i) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.status;
        return (
          <div 
            key={i} 
            onClick={() => onCardClick && onCardClick(card.status)}
            className={`gradient-border-card premium-hover-card shimmer-trigger p-5 text-left flex flex-col justify-between min-h-[130px] border border-white/50 dark:border-slate-800 transition-all duration-300 ${
              onCardClick ? 'cursor-pointer' : ''
            } ${
              isActive 
                ? 'ring-4 ring-blue-500/20 dark:ring-blue-400/30 scale-[1.01]' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`rounded-xl p-2.5 border ${card.iconColor}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
