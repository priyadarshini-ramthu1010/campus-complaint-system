import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([
    { id: '1', name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. A. K. Sharma', building: 'Tech Block A', students: 450, status: 'Active' },
    { id: '2', name: 'Information Technology', code: 'IT', hod: 'Dr. Meena Verma', building: 'Tech Block B', students: 380, status: 'Active' },
    { id: '3', name: 'Electrical & Electronics', code: 'EEE', hod: 'Prof. R. C. Gupta', building: 'Engineering Wing 1', students: 320, status: 'Active' },
    { id: '4', name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Suresh Kumar', building: 'Workshop Complex', students: 290, status: 'Active' },
    { id: '5', name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. P. N. Rao', building: 'Structure Building', students: 240, status: 'Active' },
    { id: '6', name: 'Chemical Engineering', code: 'CHEM', hod: 'Dr. S. Mukherjee', building: 'Science Block C', students: 180, status: 'Active' }
  ]);

  const [searchVal, setSearchVal] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [hod, setHod] = useState('');
  const [building, setBuilding] = useState('');
  const [students, setStudents] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    d.code.toLowerCase().includes(searchVal.toLowerCase()) ||
    d.hod.toLowerCase().includes(searchVal.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setHod('');
    setBuilding('Tech Block A');
    setStudents('');
    setDeptStatus('Active');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setHod(dept.hod);
    setBuilding(dept.building);
    setStudents(dept.students);
    setDeptStatus(dept.status);
    setIsAddModalOpen(true);
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      toast.error('Department name and code are required');
      return;
    }

    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? {
        ...d,
        name: deptName,
        code: deptCode.toUpperCase(),
        hod: hod || 'Unassigned',
        building,
        students: parseInt(students) || d.students,
        status: deptStatus
      } : d));
      toast.success(`Department "${deptCode}" updated successfully!`);
    } else {
      const newDept = {
        id: Date.now().toString(),
        name: deptName,
        code: deptCode.toUpperCase(),
        hod: hod || 'Unassigned',
        building: building || 'Main Block',
        students: parseInt(students) || 0,
        status: deptStatus
      };
      setDepartments(prev => [newDept, ...prev]);
      toast.success(`New department "${newDept.code}" created successfully!`);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteDepartment = (id, name) => {
    if (window.confirm(`Are you sure you want to delete department "${name}"?`)) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success(`Department "${name}" deleted.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
            Academic Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-purple-400" /> Academic Departments
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Manage campus academic departments, heads of department, buildings, and student enrollments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> Add New Department
        </button>
      </div>

      {/* Search Bar & Counter */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search department name, code, HOD..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-bold">
          Showing <span className="text-purple-400 font-extrabold">{filteredDepts.length}</span> departments
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Department Name</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">HOD</th>
                <th className="px-5 py-4">Building</th>
                <th className="px-5 py-4">Enrolled Students</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
              {filteredDepts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-extrabold text-slate-100 text-sm block">{d.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 font-bold border border-purple-800/60 text-xs">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-200">{d.hod}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <Building2 className="h-3.5 w-3.5 text-indigo-400" /> {d.building}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <Users className="h-3.5 w-3.5 text-blue-400" /> {d.students} Students
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      d.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/50 transition-colors"
                        title="Edit Department"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(d.id, d.name)}
                        className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-100">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MECH"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">HOD Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Suresh Kumar"
                    value={hod}
                    onChange={(e) => setHod(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Building</label>
                  <input
                    type="text"
                    placeholder="e.g. Workshop Complex"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Enrolled Students</label>
                  <input
                    type="number"
                    placeholder="e.g. 290"
                    value={students}
                    onChange={(e) => setStudents(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDepartments;
