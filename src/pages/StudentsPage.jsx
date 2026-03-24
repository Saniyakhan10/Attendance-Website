import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { UserPlus, Edit3, Trash2, Search, Filter, X, Check, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

function StudentModal({ student, batches, onSave, onClose }) {
  const [form, setForm] = useState(student || {
    name: '', email: '', rollNo: '', batchId: batches[0]?.id || '',
    phone: '', joinDate: new Date().toISOString().split('T')[0], password: 'pass123'
  });

  const handleSave = () => {
    if (!form.name || !form.email || !form.rollNo) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-display text-white">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Roll Number *</label>
              <input value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })}
                className="input-field" placeholder="BCA001" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-field" placeholder="student@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field" placeholder="Password" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Batch</label>
              <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}
                className="select-field">
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Join Date</label>
              <input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })}
                className="input-field" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {student ? 'Update' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const { students, batches, addStudent, updateStudent, deleteStudent, getAttendanceRate, getStudentStreak } = useApp();
  const [modal, setModal] = useState(null); // null | 'add' | student
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchBatch = batchFilter === 'all' || s.batchId === batchFilter;
    return matchSearch && matchBatch;
  });

  const handleSave = (form) => {
    if (modal === 'add') {
      addStudent(form);
      toast.success('Student added successfully! 🎉');
    } else {
      updateStudent(modal.id, form);
      toast.success('Student updated successfully!');
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    deleteStudent(id);
    setDeleteConfirm(null);
    toast.success('Student removed');
  };

  return (
    <Layout title="Students" subtitle="Manage your student roster">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input-field pl-11"
              placeholder="Search by name, email, roll number..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
                value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
              >
                <option value="all" className="bg-[#1a1730]">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id} className="bg-[#1a1730]">{b.name}</option>)}
              </select>
            </div>
            <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <UserPlus className="w-4 h-4" /> Add Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Students', value: students.length, color: 'text-purple-400' },
            { label: 'Above 90%', value: students.filter(s => getAttendanceRate(s.id) >= 90).length, color: 'text-green-400' },
            { label: 'Below 75%', value: students.filter(s => getAttendanceRate(s.id) < 75).length, color: 'text-red-400' },
            { label: 'Batches', value: batches.length, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Batch</th>
                  <th>Phone</th>
                  <th>Attendance</th>
                  <th>Streak</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No students found</td></tr>
                ) : filtered.map(s => {
                  const rate = getAttendanceRate(s.id);
                  const streak = getStudentStreak(s.id);
                  const batch = batches.find(b => b.id === s.batchId);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {s.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-white">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs bg-white/5 px-2 py-1 rounded">{s.rollNo}</span></td>
                      <td>
                        <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/20">
                          {batch?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="text-slate-400">{s.phone || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full w-16">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${rate}%`,
                                background: rate >= 75 ? '#10b981' : rate > 0 ? '#ef4444' : 'rgba(255,255,255,0.1)'
                              }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${rate === 0 ? 'text-slate-600' : rate >= 75 ? 'text-green-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {rate > 0 ? `${rate}%` : '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-orange-400 font-semibold text-sm">🔥 {streak}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModal(s)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(s.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <StudentModal
          student={modal === 'add' ? null : modal}
          batches={batches}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="glass-card p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Student?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. All attendance records will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
