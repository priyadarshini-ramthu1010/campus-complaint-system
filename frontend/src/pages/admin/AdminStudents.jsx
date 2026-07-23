import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  ShieldAlert
} from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { role: 'student' } });
      if (res.success && res.data && res.data.users) {
        setStudents(res.data.users);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
    const matchesDept = !deptFilter || s.department === deptFilter;
    const matchesYear = !yearFilter || s.year === yearFilter;
    return matchesSearch && matchesDept && matchesYear;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Export CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.info("No student data available to export");
      return;
    }
    const headers = ["Student ID,Name,Roll Number,Email,Phone,Department,Year,Role,Created At"];
    const rows = filteredStudents.map(s => 
      `"${s.id || s._id}","${s.name}","${s.roll_number || 'N/A'}","${s.email}","${s.phone || 'N/A'}","${s.department || 'N/A'}","${s.year || 'N/A'}","${s.role}","${s.created_at || 'N/A'}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Student directory exported to CSV!");
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            Enrolled Student Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <Users className="h-7 w-7 text-purple-400" /> Registered Students
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Manage student records, review enrollment details, and inspect assigned maintenance history.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Student CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Academic Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {(searchTerm || deptFilter || yearFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setDeptFilter(''); setYearFilter(''); setCurrentPage(1); }}
              className="text-xs font-bold text-purple-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <Loader />
      ) : filteredStudents.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center text-slate-400 text-sm">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department & Year</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
                {paginatedStudents.map((s) => (
                  <tr key={s.id || s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                          {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-100 text-sm">{s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-400">
                      {s.roll_number || 'STU-NEW'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-100">{s.department || 'Computer Science'}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{s.year || '3rd Year'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[11px] gap-0.5">
                        <span className="text-slate-300 flex items-center gap-1"><Phone className="h-3 w-3 text-slate-500" /> {s.phone || 'N/A'}</span>
                        <span className="text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3 text-slate-500" /> {s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Student
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold border border-purple-800/50 transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Student Profile & Enrollment"
        >
          <div className="flex flex-col gap-5 text-left text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="h-14 w-14 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xl shadow-lg">
                {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-100">{selectedStudent.name}</h3>
                <span className="text-purple-400 font-mono font-bold text-xs">{selectedStudent.roll_number || 'STU-ENROLLED'}</span>
                <span className="text-slate-400 font-semibold">{selectedStudent.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Department</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{selectedStudent.department || 'Computer Science'}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Year</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{selectedStudent.year || '3rd Year'}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{selectedStudent.phone || '9876543210'}</p>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Role</span>
                <p className="text-sm font-bold text-purple-400 mt-0.5 capitalize">{selectedStudent.role}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminStudents;
