import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { Check, X, Clock, CheckSquare, Save, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_CYCLE = ['present', 'absent', 'late'];
const REASONS = ['Sick 🤒', 'Personal 🏠', 'Other 📝'];

function AttendanceButton({ status, onClick }) {
  if (status === 'present') return (
    <button onClick={onClick} className="att-selected-present" title="Present">✓</button>
  );
  if (status === 'absent') return (
    <button onClick={onClick} className="att-selected-absent" title="Absent">✗</button>
  );
  if (status === 'late') return (
    <button onClick={onClick} className="att-selected-late" title="Late">⏳</button>
  );
  return (
    <button onClick={onClick} className="att-present" title="Click to mark">—</button>
  );
}

export default function AttendancePage() {
  const { students, batches, attendance, markAttendance, getAttendanceForDate, getAttendanceRate } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  // Default to first batch instead of "all"
  const [selectedBatch, setSelectedBatch] = useState(batches.length > 0 ? batches[0].id : '');
  const [reasonModal, setReasonModal] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Only show students of the selected batch
  const batchStudents = students.filter(s => s.batchId === selectedBatch);
  const selectedBatchObj = batches.find(b => b.id === selectedBatch);

  const getStatus = (studentId) => {
    const key = `${selectedDate}_${studentId}`;
    return attendance[key]?.status;
  };

  const cycleStatus = (studentId) => {
    const current = getStatus(studentId);
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    if (next === 'absent') {
      setReasonModal({ studentId, status: 'absent' });
    } else {
      markAttendance(selectedDate, studentId, next);
    }
  };

  const markAll = (status) => {
    batchStudents.forEach(s => markAttendance(selectedDate, s.id, status));
    toast.success(`Marked all as ${status}!`);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Attendance saved! ✅');
  };

  // Today's stats — only for selected batch
  const todayRecords = getAttendanceForDate(selectedDate).filter(r =>
    batchStudents.some(s => s.id === r.studentId)
  );
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const absentCount  = todayRecords.filter(r => r.status === 'absent').length;
  const lateCount    = todayRecords.filter(r => r.status === 'late').length;
  const unmarked     = batchStudents.length - todayRecords.length;

  return (
    <Layout title="Mark Attendance" subtitle="Track daily student attendance">
      <div className="space-y-5">
        {/* Controls */}
        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="input-field w-48"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Select Batch *</label>
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="select-field w-56"
              >
                {batches.length === 0 && <option value="">No batches</option>}
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.mentor ? `(${b.mentor})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap md:ml-auto">
              <button onClick={() => markAll('present')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all text-sm font-medium">
                <CheckSquare className="w-4 h-4" /> Mark All Present
              </button>
              <button onClick={() => markAll('absent')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                <X className="w-4 h-4" /> Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Batch Info */}
        {selectedBatchObj && (
          <div className="flex items-center gap-3 text-sm text-slate-400 px-1">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">{selectedBatchObj.name}</span>
            {selectedBatchObj.mentor && (
              <span className="text-purple-400">· Mentor: {selectedBatchObj.mentor}</span>
            )}
            <span>· {batchStudents.length} students</span>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Present', value: presentCount, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { label: 'Absent',  value: absentCount,  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
            { label: 'Late',    value: lateCount,    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { label: 'Unmarked', value: unmarked,    color: 'text-slate-400',  bg: 'bg-white/5',      border: 'border-white/10' },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl ${s.bg} border ${s.border} text-center`}>
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* No batch selected */}
        {!selectedBatch && (
          <div className="glass-card p-12 text-center">
            <Users className="w-14 h-14 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Please select a batch to mark attendance.</p>
          </div>
        )}

        {/* Attendance Table */}
        {selectedBatch && batchStudents.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <h3 className="font-semibold text-white">
                  {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {batchStudents.length} students · Click status to cycle P→A→L
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save</>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll No.</th>
                    <th className="text-center">Today's Status</th>
                    <th className="text-center">Overall %</th>
                    <th>Reason</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStudents.map((s, idx) => {
                    const key = `${selectedDate}_${s.id}`;
                    const record = attendance[key];
                    const status = record?.status;
                    const overallRate = getAttendanceRate(s.id);

                    return (
                      <tr key={s.id}>
                        <td className="text-slate-500 text-xs">{idx + 1}</td>
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
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <AttendanceButton status={status} onClick={() => cycleStatus(s.id)} />
                            {status && (
                              <span className={`badge ${status === 'present' ? 'badge-present' : status === 'absent' ? 'badge-absent' : 'badge-late'}`}>
                                {status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`text-sm font-bold ${
                            overallRate === 0 ? 'text-slate-600'
                            : overallRate >= 75 ? 'text-green-400'
                            : overallRate >= 50 ? 'text-yellow-400'
                            : 'text-red-400'
                          }`}>
                            {overallRate > 0 ? `${overallRate}%` : '—'}
                          </span>
                        </td>
                        <td>
                          {status === 'absent' && record?.reason ? (
                            <span className="text-xs text-slate-400">{record.reason}</span>
                          ) : status === 'absent' ? (
                            <button
                              onClick={() => setReasonModal({ studentId: s.id, status: 'absent' })}
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              + Add reason
                            </button>
                          ) : '—'}
                        </td>
                        <td className="text-xs text-slate-400">{record?.time || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedBatch && batchStudents.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-14 h-14 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No students in this batch yet. Add students first!</p>
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {reasonModal && (
        <div className="modal-overlay">
          <div className="glass-card p-8 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Reason for Absence</h3>
            <p className="text-slate-400 text-sm mb-4">Select or enter a reason</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r.split(' ')[0])}
                  className={`p-3 rounded-xl text-sm text-center transition-all border
                    ${reason === r.split(' ')[0]
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-field mb-4"
              placeholder="Custom reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  markAttendance(selectedDate, reasonModal.studentId, 'absent', reason);
                  setReasonModal(null);
                  setReason('');
                }}
                className="btn-primary flex-1"
              >
                Confirm Absent
              </button>
              <button
                onClick={() => { setReasonModal(null); setReason(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
