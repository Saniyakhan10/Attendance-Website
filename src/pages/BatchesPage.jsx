import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Plus, Edit3, Trash2, X, Check, Users, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan'];
const COLOR_MAP = {
  purple: 'from-purple-600 to-blue-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-teal-600',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-600 to-purple-600',
  cyan: 'from-cyan-500 to-blue-500',
};

function BatchModal({ batch, onSave, onClose }) {
  const [form, setForm] = useState(batch || {
    name: '', description: '', mentor: '', time: '9:00 AM', days: 'Mon-Wed-Fri', color: 'purple'
  });

  const handleSave = () => {
    if (!form.name) { toast.error('Batch name is required'); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-display text-white">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Batch Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="e.g. BCA 1st Year" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" placeholder="e.g. Full-stack Web Development Course" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Mentor Name</label>
            <input value={form.mentor || ''} onChange={e => setForm({ ...form, mentor: e.target.value })}
              className="input-field" placeholder="e.g. Sanket Rahangdale" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Class Time</label>
              <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="input-field" placeholder="9:00 AM" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Days</label>
              <input value={form.days} onChange={e => setForm({ ...form, days: e.target.value })}
                className="input-field" placeholder="Mon-Wed-Fri" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Color Theme</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${COLOR_MAP[c]} transition-all
                    ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1730] scale-110' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {batch ? 'Update' : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BatchesPage() {
  const { batches, students, addBatch, updateBatch, deleteBatch, getAttendanceRate, getBatchStats } = useApp();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (form) => {
    if (modal === 'add') {
      addBatch(form);
      toast.success('Batch created! 🎉');
    } else {
      updateBatch(modal.id, form);
      toast.success('Batch updated!');
    }
    setModal(null);
  };

  return (
    <Layout title="Batches" subtitle="Manage your classes and groups">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">{batches.length} active batches · {students.length} total students</p>
          </div>
          <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>

        {/* Batch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map(batch => {
            const batchStudents = students.filter(s => s.batchId === batch.id);
            const stats = getBatchStats(batch.id);
            const colorClass = COLOR_MAP[batch.color] || COLOR_MAP.purple;

            return (
              <div key={batch.id} className="glass-card-hover p-5 relative group">
                {/* Gradient Bar */}
                <div className={`h-1 rounded-full bg-gradient-to-r ${colorClass} mb-4 -mx-5 -mt-5 pt-5 px-5 rounded-t-2xl`}
                  style={{ marginTop: '-20px', paddingTop: '4px' }}>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setModal(batch)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm(batch.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-0.5">{batch.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{batch.description}</p>

                <div className="flex gap-4 text-xs text-slate-400 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {batch.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {batch.days}
                  </span>
                  {batch.mentor && (
                    <span className="flex items-center gap-1.5 text-purple-400">
                      👨‍🏫 {batch.mentor}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{stats.count}</div>
                    <div className="text-xs text-slate-500">Students</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <div className={`text-lg font-bold ${stats.avg >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.avg}%</div>
                    <div className="text-xs text-slate-500">Avg Attendance</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{batchStudents.filter(s => getAttendanceRate(s.id) >= 90).length}</div>
                    <div className="text-xs text-slate-500">Above 90%</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Attendance Rate</span>
                    <span>{stats.avg}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000`}
                      style={{ width: `${stats.avg}%` }}
                    />
                  </div>
                </div>

                {/* Students */}
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Students ({batchStudents.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {batchStudents.slice(0, 6).map(s => (
                      <div key={s.id} title={s.name}
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-bold text-white`}>
                        {s.avatar}
                      </div>
                    ))}
                    {batchStudents.length > 6 && (
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs text-slate-400">
                        +{batchStudents.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add placeholder */}
          <button
            onClick={() => setModal('add')}
            className="glass-card p-5 border-dashed border-white/15 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group flex flex-col items-center justify-center gap-3 min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-dashed border-white/15 group-hover:border-purple-500/40 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <p className="text-slate-500 group-hover:text-slate-300 transition-colors font-medium">Create New Batch</p>
          </button>
        </div>

        {/* Comparison table */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Batch Comparison</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Students</th>
                  <th>Avg Attendance</th>
                  <th>Above 90%</th>
                  <th>Below 75%</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const bs = students.filter(s => s.batchId === b.id);
                  const stats = getBatchStats(b.id);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${COLOR_MAP[b.color] || COLOR_MAP.purple}`} />
                          <span className="font-medium text-white">{b.name}</span>
                        </div>
                      </td>
                      <td>{bs.length}</td>
                      <td>
                        <span className={`font-semibold ${stats.avg >= 75 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.avg}%</span>
                      </td>
                      <td className="text-green-400">{bs.filter(s => getAttendanceRate(s.id) >= 90).length}</td>
                      <td className="text-red-400">{bs.filter(s => getAttendanceRate(s.id) < 75).length}</td>
                      <td className="text-slate-400 text-xs">{b.time} · {b.days}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <BatchModal
          batch={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="glass-card p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Batch?</h3>
            <p className="text-slate-400 text-sm mb-6">This will remove the batch but keep student records.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { deleteBatch(deleteConfirm); setDeleteConfirm(null); toast.success('Batch deleted'); }}
                className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
