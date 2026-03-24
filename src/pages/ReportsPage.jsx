import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getMonth } from 'date-fns';
import { Download, Search, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}{p.name === 'Rate' ? '%' : ''}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// GitHub-style heatmap
function AttendanceHeatmap({ studentId, attendance, getAttendanceForDate }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 89), end: new Date() });

  const getCellClass = (date) => {
    const key = `${format(date, 'yyyy-MM-dd')}_${studentId}`;
    const rec = attendance[key];
    if (!rec) return 'heatmap-0';
    if (rec.status === 'absent') return 'heatmap-absent';
    if (rec.status === 'late') return 'heatmap-1';
    return 'heatmap-3';
  };

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div
                key={day.toString()}
                className={`heatmap-cell ${getCellClass(day)}`}
                title={`${format(day, 'MMM d')}: ${attendance[`${format(day, 'yyyy-MM-dd')}_${studentId}`]?.status || 'no data'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Less</span>
        {['heatmap-0', 'heatmap-1', 'heatmap-2', 'heatmap-3'].map(c => (
          <div key={c} className={`heatmap-cell ${c}`} style={{ width: 12, height: 12 }} />
        ))}
        <span>More</span>
        <span className="ml-4 flex items-center gap-1">
          <div className="heatmap-cell heatmap-absent" style={{ width: 12, height: 12 }} /> Absent
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { students, batches, attendance, getAttendanceRate, getStudentAttendance, getAttendanceForDate, getBatchStats } = useApp();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [batchFilter, setBatchFilter] = useState('all');

  const filtered = students.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const mb = batchFilter === 'all' || s.batchId === batchFilter;
    return ms && mb;
  });

  const sorted = [...filtered].sort((a, b) => getAttendanceRate(b.id) - getAttendanceRate(a.id));

  // Month-wise data for selected student
  const getMonthlyData = (studentId) => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subDays(new Date(), i * 30);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const days = eachDayOfInterval({ start, end });
      const records = days.map(day => attendance[`${format(day, 'yyyy-MM-dd')}_${studentId}`]).filter(Boolean);
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const total = records.length || 1;
      return {
        month: format(d, 'MMM'),
        Present: records.filter(r => r.status === 'present').length,
        Absent: records.filter(r => r.status === 'absent').length,
        Late: records.filter(r => r.status === 'late').length,
        Rate: Math.round((present / total) * 100),
      };
    }).reverse();
    return months;
  };

  const exportExcel = () => {
    // Simple CSV export
    const rows = [['Name', 'Roll No', 'Batch', 'Attendance %', 'Present', 'Absent', 'Late']];
    students.forEach(s => {
      const records = getStudentAttendance(s.id);
      const batch = batches.find(b => b.id === s.batchId);
      rows.push([
        s.name, s.rollNo, batch?.name || '',
        getAttendanceRate(s.id) + '%',
        records.filter(r => r.status === 'present').length,
        records.filter(r => r.status === 'absent').length,
        records.filter(r => r.status === 'late').length,
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'technoskill_attendance.csv'; a.click();
    toast.success('Attendance report downloaded! 📊');
  };

  const sel = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  const selRate = sel ? getAttendanceRate(sel.id) : 0;
  const selRecords = sel ? getStudentAttendance(sel.id) : [];
  const selMonthly = sel ? getMonthlyData(sel.id) : [];
  const absenceReasons = sel ? selRecords.filter(r => r.status === 'absent' && r.reason).reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1; return acc;
  }, {}) : {};

  return (
    <Layout title="Reports & Analytics" subtitle="Deep dive into attendance data">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input-field pl-11"
              placeholder="Search students..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
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
          <button onClick={exportExcel} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Student List */}
          <div className="glass-card overflow-hidden xl:col-span-1">
            <div className="p-4 border-b border-white/8">
              <h3 className="font-semibold text-white">Student Records</h3>
              <p className="text-xs text-slate-400 mt-0.5">{sorted.length} students · Click to view details</p>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {sorted.map(s => {
                const rate = getAttendanceRate(s.id);
                const batch = batches.find(b => b.id === s.batchId);
                const isSelected = selectedStudent === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(isSelected ? null : s.id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-white/5
                      ${isSelected ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : 'hover:bg-white/3'}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">{batch?.name?.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${rate >= 90 ? 'text-green-400' : rate >= 75 ? 'text-blue-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {rate}%
                      </div>
                      {rate < 75 && (
                        <div className="text-xs text-red-400 flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" /> Low
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="xl:col-span-2 space-y-5">
            {sel ? (
              <>
                {/* Student Info */}
                <div className="glass-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-glow">
                      {sel.avatar}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{sel.name}</h2>
                      <p className="text-slate-400 text-sm">{sel.email} · {sel.rollNo}</p>
                      <p className="text-slate-500 text-xs mt-1">{batches.find(b => b.id === sel.batchId)?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold font-display ${selRate >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                        {selRate}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Overall Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[
                      { l: 'Present', v: selRecords.filter(r => r.status === 'present').length, c: 'text-green-400' },
                      { l: 'Absent', v: selRecords.filter(r => r.status === 'absent').length, c: 'text-red-400' },
                      { l: 'Late', v: selRecords.filter(r => r.status === 'late').length, c: 'text-yellow-400' },
                      { l: 'Total Days', v: selRecords.length, c: 'text-blue-400' },
                    ].map(x => (
                      <div key={x.l} className="text-center p-3 rounded-xl bg-white/3">
                        <div className={`text-xl font-bold ${x.c}`}>{x.v}</div>
                        <div className="text-xs text-slate-500">{x.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Insight */}
                  {selRate < 75 && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                      ⚠️ Low attendance warning: This student may face eligibility issues.
                    </div>
                  )}
                  {selRate >= 95 && (
                    <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-300">
                      🏆 Excellent attendance! Eligible for Perfect Attendance badge.
                    </div>
                  )}
                </div>

                {/* Monthly Chart */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Monthly Breakdown</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={selMonthly} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Present" fill="#10b981" radius={[3,3,0,0]} />
                      <Bar dataKey="Absent" fill="#ef4444" radius={[3,3,0,0]} />
                      <Bar dataKey="Late" fill="#f59e0b" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Heatmap */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Attendance Heatmap (Last 90 days)</h3>
                  <AttendanceHeatmap
                    studentId={sel.id}
                    attendance={attendance}
                    getAttendanceForDate={getAttendanceForDate}
                  />
                </div>

                {/* Absence Reasons */}
                {Object.keys(absenceReasons).length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-4">Absence Reasons</h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(absenceReasons).map(([reason, count]) => (
                        <div key={reason} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <div className="text-lg font-bold text-white">{count}</div>
                          <div className="text-xs text-slate-400">{reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a Student</h3>
                <p className="text-slate-400 text-sm">Click on any student to view their detailed attendance reports, heatmap, and insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
