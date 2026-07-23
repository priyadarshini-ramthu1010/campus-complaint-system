import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Plus, 
  Info, 
  MessageSquare, 
  Star, 
  Trash2,
  FileText,
  AlertCircle,
  Hourglass,
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Download,
  Phone,
  Sun,
  Moon,
  Shield,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Mail,
  User,
  Wrench,
  Sparkles,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import Pagination from '../../components/Pagination';
import ColorChangingEmailInput from '../../components/ColorChangingEmailInput';
import AIAssistantWidget from '../../components/AIAssistantWidget';

const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Tabs Switch from query parameter
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'dashboard';
  
  // States
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVal, setSearchVal] = useState(''); // Trigger filter search on click
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Modal Details
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [detailComplaint, setDetailComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Feedback states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Settings mock states
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(false);
  const [settingsEmail, setSettingsEmail] = useState(user?.email || 'student@campus.com');

  // Fetch list and stats
  const fetchComplaints = async () => {
    setLoading(true);
    let list = [];
    try {
      const params = {
        page,
        limit: 10,
        search: searchVal,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      };

      const res = await api.get('/complaints', { params });
      if (res && res.success && res.data && res.data.complaints) {
        list = res.data.complaints;
      }
    } catch (err) {
      console.warn('API fetch complaints fallback:', err);
    }

    // Merge custom local complaints
    try {
      const custom = JSON.parse(localStorage.getItem('campusfix_custom_complaints') || '[]');
      list = [...custom, ...list];
    } catch (e) {}

    // Filter and sort client-side if needed
    let filtered = [...list];
    if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
    if (priorityFilter) filtered = filtered.filter(c => c.priority === priorityFilter);
    if (categoryFilter) filtered = filtered.filter(c => c.category === categoryFilter);
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.complaint_number && c.complaint_number.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'date_desc') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'date_asc') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'priority') {
      const priorityMap = { 'Emergency': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      filtered.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));
    }

    setComplaints(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / 10) || 1);
    setLoading(false);
  };

  const fetchStats = async () => {
    let list = [];
    try {
      const res = await api.get('/complaints', { params: { limit: 1000 } });
      if (res && res.success && res.data && res.data.complaints) {
        list = res.data.complaints;
      }
    } catch (e) {}

    try {
      const custom = JSON.parse(localStorage.getItem('campusfix_custom_complaints') || '[]');
      list = [...custom, ...list];
    } catch (e) {}

    const total = list.length;
    const pending = list.filter(c => c.status === 'Pending').length;
    const in_progress = list.filter(c => c.status === 'In Progress').length;
    const resolved = list.filter(c => c.status === 'Resolved').length;
    setStats({ total, pending, in_progress, resolved });
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, searchVal, statusFilter, priorityFilter, categoryFilter, sortBy]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchVal(searchTerm);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchVal('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setSortBy('date_desc');
    setPage(1);
  };

  const handleCardClick = (status) => {
    setStatusFilter(status);
    setPage(1);
    const element = document.getElementById('complaint-grid-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedComplaintId(id);
    setIsDetailOpen(true);
    setDetailLoading(true);
    setRating(5);
    setComment('');
    
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.success) {
        setDetailComplaint(res.data.complaint);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load details');
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    setFeedbackSubmitting(true);
    try {
      const res = await api.post('/feedback', {
        complaint_id: selectedComplaintId,
        rating,
        comment
      });
      if (res.success) {
        toast.success('Feedback submitted successfully!');
        handleViewDetails(selectedComplaintId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (complaints.length === 0) {
      toast.info("No data to export");
      return;
    }
    const headers = ["Ticket ID,Title,Category,Priority,Status,Building,Floor,Room,Created At"];
    const rows = complaints.map(c => 
      `"${c.complaint_number}","${c.title}","${c.category}","${c.priority}","${c.status}","${c.building}","${c.floor}","${c.room_number}","${c.created_at}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning 👋';
    if (hr < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  const renderStatusChip = (status) => {
    const configs = {
      'Pending': 'bg-orange-50 text-orange-700 border-orange-200',
      'Assigned': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-red-50 text-red-700 border-red-200',
    };
    const style = configs[status] || 'bg-slate-50 text-slate-600 border-slate-200';
    const hasPulse = ['Pending', 'Assigned', 'In Progress'].includes(status);

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
        {hasPulse && <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>}
        {status}
      </span>
    );
  };

  const renderPriorityChip = (priority) => {
    const configs = {
      'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'High': 'bg-orange-50 text-orange-700 border-orange-200',
      'Emergency': 'bg-red-50 text-red-700 border-red-200',
    };
    const style = configs[priority] || 'bg-slate-50 text-slate-600 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${style}`}>
        {priority}
      </span>
    );
  };

  // Recharts aggregation data helper
  const getCategoryChartData = () => {
    const list = complaints.length > 0 ? complaints : [
      { category: 'Electrical' }, { category: 'Plumbing' }, { category: 'Internet' }
    ];
    const map = {};
    list.forEach(c => {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  };

  const getPriorityChartData = () => {
    const list = complaints.length > 0 ? complaints : [
      { priority: 'High' }, { priority: 'Medium' }, { priority: 'Low' }
    ];
    const map = {};
    list.forEach(c => {
      map[c.priority] = (map[c.priority] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  };

  const categories = ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Laboratory", "Classroom", "Hostel", "Civil", "Water Supply", "Others"];

  // TAB 1: Profile View Redesign
  const renderProfileTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <div className="md:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center text-center gap-4">
        <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl shadow-inner">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">{user?.name}</h2>
          <span className="text-xs bg-blue-50 text-primary border border-blue-100 px-3 py-1 rounded-full font-bold uppercase block mt-1 w-max mx-auto">
            {user?.role}
          </span>
        </div>
        <div className="w-full border-t border-slate-50 pt-4 flex flex-col gap-2.5 text-xs font-semibold text-slate-500">
          <div className="flex justify-between">
            <span>Roll Number</span>
            <span className="text-slate-800 font-bold">{user?.roll_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="text-slate-800 font-bold">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone</span>
            <span className="text-slate-800 font-bold">{user?.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Academic & Facility Profile</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Campus registration profile details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
            <p className="text-sm font-bold text-slate-800 mt-1">{user?.department || 'Computer Science & Engineering'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Year</span>
            <p className="text-sm font-bold text-slate-800 mt-1">{user?.year || '3rd Year'}</p>
          </div>
        </div>

        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/30 flex items-start gap-3 mt-2 text-xs">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-blue-800">
            <span className="font-bold">Need to update registration details?</span>
            <p className="text-blue-600/90 font-medium">To modify your department, phone, or roll number, please contact the campus administrator office at support@campusfix.edu.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // TAB 2: Settings View Redesign
  const renderSettingsTab = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm text-left max-w-2xl flex flex-col gap-6 transition-colors duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Account Settings</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Control notification systems and preferences</p>
      </div>

      <div className="flex flex-col gap-4 divide-y divide-slate-50 dark:divide-slate-800">
        
        {/* Email toggle & Address Verification */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</span>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Receive status updates and assignments on your inbox</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailNotify} 
                onChange={() => setEmailNotify(!emailNotify)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {emailNotify && (
            <div className="mt-1 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Primary Notification Email (Dynamic Typing Color Shifting Enabled)</span>
              <ColorChangingEmailInput
                value={settingsEmail}
                onChange={(e) => setSettingsEmail(e.target.value)}
                placeholder="your-alert-email@campus.com"
              />
            </div>
          )}
        </div>

        {/* SMS toggle */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">SMS Alerts</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Receive real-time text updates for critical tasks</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={smsNotify} 
              onChange={() => setSmsNotify(!smsNotify)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* System Theme Selection */}
        <div className="flex flex-col gap-2.5 pt-4">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Dashboard Theme</span>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Customize workspace theme style</p>
          <div className="grid grid-cols-2 gap-3 mt-1.5 max-w-sm">
            <button 
              type="button"
              onClick={() => setThemeMode('light')} 
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                !isDark 
                  ? 'border-primary/40 bg-blue-50/70 dark:bg-blue-950/40 text-primary dark:text-blue-400 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="h-4 w-4" /> Light theme
            </button>
            <button 
              type="button"
              onClick={() => setThemeMode('dark')} 
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                isDark 
                  ? 'border-primary/40 bg-blue-50/70 dark:bg-blue-950/40 text-primary dark:text-blue-400 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="h-4 w-4" /> Dark theme
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  // TAB 3: Help Center Redesign
  const renderHelpTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      
      {/* Contact Cards */}
      <div className="md:col-span-1 flex flex-col gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <Phone className="h-4.5 w-4.5 text-primary" /> Maintenance Hotline
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">Direct contact numbers for repair categories</p>
          <div className="flex flex-col gap-2.5 mt-4 divide-y divide-slate-50">
            <div className="flex justify-between text-xs pt-2">
              <span className="font-semibold text-slate-600">⚡ Electrical repairs</span>
              <span className="font-bold text-slate-800">+91-99887-76655</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="font-semibold text-slate-600">🚰 Water supply</span>
              <span className="font-bold text-slate-800">+91-88776-65544</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="font-semibold text-slate-600">🌐 Wi-Fi & IT network</span>
              <span className="font-bold text-slate-800">+91-77665-54433</span>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="font-semibold text-slate-600">🔨 Carpentry & locks</span>
              <span className="font-bold text-slate-800">+91-66554-43322</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Quick resolutions on platform support</p>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div className="border-b border-slate-50 pb-3 flex flex-col gap-1">
            <h4 className="font-bold text-slate-700">Q: How long does a repair resolution take?</h4>
            <p className="text-slate-400 font-semibold leading-relaxed">A: High priority requests (Emergency) are addressed within 12 hours. Normal priority tasks are resolved in 2-3 business days.</p>
          </div>
          <div className="border-b border-slate-50 pb-3 flex flex-col gap-1">
            <h4 className="font-bold text-slate-700">Q: Can I edit a ticket after submission?</h4>
            <p className="text-slate-400 font-semibold leading-relaxed">A: You cannot modify parameters after a staff repairman is assigned. To apply edits, contact the admin office.</p>
          </div>
          <div className="border-b border-slate-50 pb-3 flex flex-col gap-1">
            <h4 className="font-bold text-slate-700">Q: How can I change the priority rank?</h4>
            <p className="text-slate-400 font-semibold leading-relaxed">A: The priority rank is assessed by the administrator based on the descriptions and images uploaded.</p>
          </div>
        </div>
      </div>

    </div>
  );

  // TAB 4: Core Overview Tab Redesign
  const renderDashboardTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      
      {/* Left 3/4 content: banner, stats, quick actions, filter bar, cards grid, pagination */}
      <div className="xl:col-span-3 flex flex-col gap-8">
        
        {/* Welcome Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-white/90 border border-white/10 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Smart Campus Maintenance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, <span className="text-yellow-300">{user?.name}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-100 font-medium">
              Track and manage your maintenance tickets. Get instant updates on repairs across the campus facility.
            </p>
          </div>
          {/* Abstract background graphics */}
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
          <Wrench className="absolute right-12 top-1/2 -translate-y-1/2 h-24 w-24 text-white/10 rotate-12 hidden lg:block pointer-events-none" />
        </div>

        {/* Statistics Cards Redesign */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Total Complaints */}
          <div 
            onClick={() => handleCardClick('')}
            className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-black text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
              <div className="rounded-xl p-2 bg-white/10 text-white shadow-inner">
                <FileText className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">{stats.total}</span>
              <span className="text-[9px] font-bold text-slate-400">↑ 12% vs last month</span>
            </div>
          </div>

          {/* Pending */}
          <div 
            onClick={() => handleCardClick('Pending')}
            className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200">Pending</span>
              <div className="rounded-xl p-2 bg-white/15 text-white">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">{stats.pending}</span>
              <span className="text-[9px] font-bold text-orange-200">↑ 2% vs last week</span>
            </div>
          </div>

          {/* In Progress */}
          <div 
            onClick={() => handleCardClick('In Progress')}
            className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">In Progress</span>
              <div className="rounded-xl p-2 bg-white/15 text-white">
                <Hourglass className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">{stats.in_progress}</span>
              <span className="text-[9px] font-bold text-purple-200">Active resolution</span>
            </div>
          </div>

          {/* Resolved */}
          <div 
            onClick={() => handleCardClick('Resolved')}
            className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Resolved</span>
              <div className="rounded-xl p-2 bg-white/15 text-white">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">{stats.resolved}</span>
              <span className="text-[9px] font-bold text-emerald-200">100% completed</span>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Speed</span>
              <div className="rounded-xl p-2 bg-white/15 text-white">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">2.4d</span>
              <span className="text-[9px] font-bold text-blue-200">↓ 14% faster avg</span>
            </div>
          </div>

          {/* High Priority */}
          <div 
            onClick={() => {
              setPriorityFilter('High');
              setPage(1);
            }}
            className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-pointer transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">Urgent</span>
              <div className="rounded-xl p-2 bg-white/15 text-white">
                <Shield className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 text-left">
              <span className="text-2xl font-extrabold">
                {complaints.filter(c => c.priority === 'High' || c.priority === 'Emergency').length}
              </span>
              <span className="text-[9px] font-bold text-rose-200">Emergency tags</span>
            </div>
          </div>

        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Actions Workspace</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/student/complaints/raise" 
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center gap-3 group"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">Raise Complaint</span>
            </Link>

            <button 
              onClick={() => {
                const element = document.getElementById('complaint-grid-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center gap-3 group"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">Track Complaint</span>
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center gap-3 group"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">Download Report</span>
            </button>

            <Link 
              to="/student/dashboard?tab=help"
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center gap-3 group"
            >
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">Contact Maintenance</span>
            </Link>
          </div>
        </div>

        {/* Complaint Filter Bar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search ticket ID, title, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Search
              </button>
              {(searchVal || statusFilter || priorityFilter || categoryFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Inline Dropdown Select Filters */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-50 pt-3 text-left">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Sort by option */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:border-primary ml-auto"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority">Priority Rank</option>
            </select>

            {/* Client-side CSV export button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Complaint Cards Grid Redesign (Instead of Table) */}
        {loading ? (
          <Loader />
        ) : complaints.length === 0 ? (
          /* Empty State Redesign */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 text-center shadow-sm max-w-lg mx-auto py-16 gap-6">
            <div className="h-28 w-28 rounded-full bg-blue-50 text-primary flex items-center justify-center text-5xl animate-bounce">
              📁
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-slate-800">No Complaints Yet</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed">
                Looks like you haven't submitted any complaints. File your first maintenance request to start repairing campus utilities!
              </p>
            </div>
            <Link 
              to="/student/complaints/raise"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" /> Raise Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div id="complaint-grid-section" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {complaints.map((comp) => {
                const hasPhoto = comp.images && comp.images.length > 0;
                const photoUrl = hasPhoto ? `http://127.0.0.1:8000/media/${comp.images[0].image_path}` : null;
                
                // Calculate mock progress bar percentage
                const getProgressPercent = (status) => {
                  if (status === 'Pending') return 15;
                  if (status === 'Assigned') return 40;
                  if (status === 'In Progress') return 70;
                  if (status === 'Resolved') return 100;
                  return 0; // Rejected
                };

                const progress = getProgressPercent(comp.status);

                return (
                  <div 
                    key={comp.id} 
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 text-left relative group overflow-hidden"
                  >
                    {/* Card top row */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-400">
                        {comp.complaint_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {renderPriorityChip(comp.priority)}
                        {renderStatusChip(comp.status)}
                      </div>
                    </div>

                    {/* Title & Category */}
                    <div className="flex flex-col gap-1">
                      <h3 className="font-extrabold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors">
                        {comp.title}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max">
                        {comp.category}
                      </span>
                    </div>

                    {/* Location and date info */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Location</span>
                        <span className="font-semibold text-slate-700">{comp.building}</span>
                        <span className="block text-[10px] text-slate-400">Floor {comp.floor}, Room {comp.room_number}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Reported On</span>
                        <span className="font-semibold text-slate-700">{new Date(comp.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                        <span>Progress</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned Staff */}
                    <div className="flex items-center justify-between text-xs border-t border-slate-50 pt-3 mt-1 text-slate-500">
                      <span className="font-medium">
                        {comp.assigned_staff_name ? (
                          <span className="text-slate-700 font-semibold flex items-center gap-1">
                            🔧 {comp.assigned_staff_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned staff</span>
                        )}
                      </span>
                      
                      {/* Photo preview link if available */}
                      {hasPhoto && (
                        <a 
                          href={photoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                        >
                          View Attachment &rarr;
                        </a>
                      )}
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3 mt-1">
                      <button
                        onClick={() => handleViewDetails(comp.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => toast.info("Real-time chat with technician coming in version 2.0!")}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-xs font-bold text-primary transition-colors flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={10}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}

        {/* Analytics Charts Redesign */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* Categories Chart */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Complaints by Category
            </span>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getCategoryChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Donut Chart */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-rose-500" /> Priority Distribution
            </span>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPriorityChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {getPriorityChartData().map((entry, index) => {
                      const colors = { Low: '#10B981', Medium: '#F59E0B', High: '#F97316', Emergency: '#EF4444' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#64748B'} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Right 1/4 sidebar: Recent activity, weather, quick announcements */}
      <div className="flex flex-col gap-6 text-left">
        
        {/* Date and Weather Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase">Today</span>
            <span className="text-base font-extrabold text-slate-800">
              {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
            <Sun className="h-5 w-5" /> 26°C • Clear
          </div>
        </div>

        {/* Recent Activity Timeline Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</span>
          
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-3 relative pb-2 border-l border-slate-100 pl-4 ml-2.5 text-xs">
              <span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100"></span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-700">Complaint Submitted</span>
                <p className="text-slate-400 font-semibold leading-relaxed">Ticket CMP-2026-0034 logged in Electrical class.</p>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
            </div>
            
            <div className="flex gap-3 relative pb-2 pl-4 ml-2.5 text-xs">
              <span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-700">Staff Assigned</span>
                <p className="text-slate-400 font-semibold leading-relaxed">Admin assigned electrical repairman to classroom lights.</p>
                <span className="text-[10px] text-slate-400">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campus Announcements Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Announcements</span>
          <div className="flex flex-col gap-3.5 mt-1">
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-slate-800 hover:text-primary cursor-pointer">Hostel A Water Main Maintenance</span>
              <p className="text-slate-400 font-semibold leading-relaxed">Water pumps will be disabled tomorrow from 10:00 AM to 12:00 PM for pipes inspection.</p>
            </div>
            <div className="flex flex-col gap-1 text-xs border-t border-slate-50 pt-2.5">
              <span className="font-bold text-slate-800 hover:text-primary cursor-pointer">Campus Wi-Fi Upgrades</span>
              <p className="text-slate-400 font-semibold leading-relaxed">Server network upgrades will resume on July 22. Intermittent downtime is expected.</p>
            </div>
          </div>
        </div>

        {/* Maintenance Contact Directory Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Tips</span>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Upload clear photographs of issues like water leakage or broken wiring so technicians can easily identify the exact issue before arriving.
          </p>
        </div>

      </div>

    </div>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 'profile':
        return renderProfileTab();
      case 'settings':
        return renderSettingsTab();
      case 'help':
        return renderHelpTab();
      case 'complaints':
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto min-h-[80vh]">
      
      {/* Current page title depending on active tab */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {currentTab === 'profile' ? 'Student Profile' :
             currentTab === 'settings' ? 'Account Preferences' :
             currentTab === 'help' ? 'Help Desk & FAQs' :
             'Student Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            {currentTab === 'profile' ? 'View and verify your registered campus profile' :
             currentTab === 'settings' ? 'Customize security, themes, and email alerts' :
             currentTab === 'help' ? 'Direct contact numbers and maintenance FAQs' :
             'Report issues and track current maintenance tickets'}
          </p>
        </div>
      </div>

      {/* Switch Tab Content */}
      {renderTabContent()}

      {/* Global Professional Footer */}
      <footer className="mt-12 border-t border-slate-200/60 pt-6 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold pb-8">
        <span>CampusFix © 2026. All rights reserved.</span>
        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
          v1.0.0
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
          <span className="hover:text-primary cursor-pointer">Support Helpdesk</span>
          <span className="hover:text-primary cursor-pointer">GitHub repo</span>
        </div>
      </footer>

      {/* Complaint details timeline modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailComplaint ? `Ticket: ${detailComplaint.complaint_number}` : 'Loading Complaint Details...'}
      >
        {detailLoading || !detailComplaint ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-6 text-left">
            
            {/* Core parameters card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</span>
                <p className="text-sm font-semibold text-slate-700">{detailComplaint.title}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category / Priority</span>
                <p className="text-sm font-semibold text-slate-700">{detailComplaint.category} ({detailComplaint.priority})</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{detailComplaint.description}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                <p className="text-xs text-slate-600 font-semibold">{detailComplaint.building}, Floor {detailComplaint.floor}, Room {detailComplaint.room_number}</p>
                {detailComplaint.location && <p className="text-[10px] text-slate-400 mt-0.5">Note: {detailComplaint.location}</p>}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Technician</span>
                <p className="text-xs text-slate-600 font-semibold">{detailComplaint.assigned_staff_name || 'Unassigned'}</p>
              </div>
            </div>

            {/* Uploaded Images */}
            {detailComplaint.images && detailComplaint.images.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complaint Attachments</h4>
                <div className="flex flex-wrap gap-3">
                  {detailComplaint.images.map((img, i) => (
                    <a 
                      key={i}
                      href={`http://127.0.0.1:8000/media/${img.image_path}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="relative border border-slate-200 rounded-xl overflow-hidden group hover:opacity-85 transition-opacity"
                    >
                      <img 
                        src={`http://127.0.0.1:8000/media/${img.image_path}`} 
                        alt="attachment" 
                        className="h-16 w-16 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution updates */}
            {detailComplaint.status === 'Resolved' && (
              <div className="bg-green-50/70 border border-green-100 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2Icon className="h-4.5 w-4.5 text-green-600" /> Issue Resolved
                </h4>
                <p className="text-xs text-green-700 font-semibold mt-2">Notes: {detailComplaint.resolution_notes}</p>
                <p className="text-[10px] text-green-400 mt-1">
                  Resolved on: {new Date(detailComplaint.resolution_date).toLocaleString('en-IN')}
                </p>
              </div>
            )}

            {/* Stepper Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Status Timeline</h4>
              <ComplaintTimeline timeline={detailComplaint.timeline} />
            </div>

            {/* Feedback section */}
            {detailComplaint.status === 'Resolved' && (
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare className="h-4.5 w-4.5 text-slate-400" /> Service Feedback
                </h4>

                {detailComplaint.feedback ? (
                  // Feedback exists
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4.5 w-4.5 ${i < detailComplaint.feedback.rating ? 'fill-current' : 'text-slate-300'}`} 
                        />
                      ))}
                      <span className="text-xs text-slate-500 font-semibold ml-1">
                        ({detailComplaint.feedback.rating} / 5)
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 italic">
                      "{detailComplaint.feedback.comment || 'No review comments left.'}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Submitted on: {new Date(detailComplaint.feedback.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ) : (
                  // Need to submit feedback
                  <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-bold">Comments</label>
                      <textarea
                        rows={2}
                        placeholder="Write a brief comment about your maintenance resolution quality..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={feedbackSubmitting}
                      className="self-end bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
                    >
                      {feedbackSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* Floating AI Maintenance Assistant Widget */}
      <AIAssistantWidget />

    </div>
  );
};

// Check icon replacement
const CheckCircle2Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default StudentDashboard;
