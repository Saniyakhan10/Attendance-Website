import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Flame, Calendar, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Heatmap({ studentId, attendance }) {
  const days = eachDayOfInterval({ start: subDays(new Date(), 89), end: new Date() });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const getCellClass = (date) => {
    const key = `${format(date, 'yyyy-MM-dd')}_${studentId}`;
    const rec = attendance[key];
    if (!rec) return 'heatmap-0';
    if (rec.status === 'absent') return 'heatmap-absent';
    if (rec.status === 'late') return 'heatmap-1';
    return 'heatmap-3';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div key={day.toString()} className={`heatmap-cell ${getCellClass(day)}`}
                title={`${format(day, 'MMM d')}: ${attendance[`${format(day, 'yyyy-MM-dd')}_${studentId}`]?.status || 'no record'}`} />
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
        <span className="ml-3 flex items-center gap-1">
          <div className="heatmap-cell heatmap-absent" style={{ width: 12, height: 12 }} /> Absent
        </span>
      </div>
    </div>
  );
}

export default function MyAttendancePage() {
  const { user, students, batches, attendance, getAttendanceRate, getStudentAttendance, getStudentStreak } = useApp();

  // For student role: match by id. For admin: pick first student as preview
  const student = students.find(s => s.id === user?.id) ?? students[0];

  if (!student) {
    return (
      <Layout title="My Attendance" subtitle="Your personal attendance record">
        <div className="glass-card p-12 text-center">
          <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Student Found</h3>
          <p className="text-slate-400 text-sm">No student data available yet.</p>
        </div>
      </Layout>
    );
  }

  const rate = getAttendanceRate(student.id);
  const streak = getStudentStreak(student.id);
  const records = getStudentAttendance(student.id);
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount  = records.filter(r => r.status === 'absent').length;
  const lateCount    = records.filter(r => r.status === 'late').length;
  const totalDays    = records.length;
  const batch = batches.find(b => b.id === student.batchId);

  // Last 30 days trend (every 3rd day as a sample point)
  const trendData = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
    .filter((_, i) => i % 3 === 0)
    .map(day => {
      const key = `${format(day, 'yyyy-MM-dd')}_${student.id}`;
      const rec = attendance[key];
      return {
        date: format(day, 'MMM d'),
        value: rec?.status === 'present' ? 1 : rec?.status === 'late' ? 0.5 : 0,
      };
    });

  const recent = [...records].reverse().slice(0, 10);

  const badges = [];
  if (totalDays > 0 && rate >= 95) badges.push({ icon: '🏆', label: 'Perfect Attendance' });
  if (totalDays > 0 && streak >= 10) badges.push({ icon: '🔥', label: `${streak}-Day Streak` });
  if (totalDays > 0 && rate >= 80 && rate < 95) badges.push({ icon: '⭐', label: 'Star Student' });

  // Only show warning if there are actual records AND rate is low
  const showWarning = totalDays > 0 && rate < 75;

  return (
    <Layout title="My Attendance" subtitle={`Welcome, ${student.name}!`}>
      <div className="space-y-5">

        {/* Admin preview banner */}
        {user?.role === 'admin' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
            👁️ Previewing as student: <strong className="ml-1">{student.name}</strong> ({batch?.name})
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-glow flex-shrink-0">
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold font-display text-white">{student.name}</h2>
              <p className="text-slate-400 text-sm">{student.rollNo} · {student.email}</p>
              <p className="text-slate-500 text-xs mt-0.5">{batch?.name} {batch?.mentor ? `· Mentor: ${batch.mentor}` : ''}</p>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {badges.map(b => (
                    <span key={b.label} className="badge badge-present">{b.icon} {b.label}</span>
                  ))}
                </div>
              )}
            </div>
            {/* SVG Rate Ring */}
            <div className="text-center flex-shrink-0">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={totalDays === 0 ? '#4b5563' : rate >= 75 ? '#10b981' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${rate * 2.51} 251`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${totalDays === 0 ? 'text-slate-500' : rate >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalDays === 0 ? '—' : `${rate}%`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Attendance Rate</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle, label: 'Present',    value: presentCount, color: 'text-green-400',  bg: 'bg-green-500/10'  },
            { icon: XCircle,     label: 'Absent',     value: absentCount,  color: 'text-red-400',    bg: 'bg-red-500/10'    },
            { icon: Clock,       label: 'Late',       value: lateCount,    color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: Flame,       label: 'Streak',     value: streak > 0 ? `${streak} days` : '0', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-5 ${s.bg}`}>
              <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* No data yet state */}
        {totalDays === 0 && (
          <div className="glass-card p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">No Attendance Recorded Yet</h3>
            <p className="text-slate-400 text-sm">Attendance will appear here once the mentor starts marking it daily.</p>
          </div>
        )}

        {totalDays > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Trend */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Attendance Trend (Last 30 days)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="myGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tick={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [v === 1 ? 'Present' : v === 0.5 ? 'Late' : 'Absent', 'Status']}
                    contentStyle={{ background: 'rgba(26,23,48,0.95)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#myGrad)" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Activity Heatmap (Last 90 days)</h3>
              <Heatmap studentId={student.id} attendance={attendance} />
            </div>
          </div>
        )}

        {/* Recent Records */}
        <div className="glass-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-semibold text-white">Recent Attendance Records</h3>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No attendance records yet. Come back after the mentor marks today's attendance!
            </div>
          ) : (
            <div style={{ divide: 'rgba(255,255,255,0.05)' }}>
              {recent.map((r, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-slate-300 flex-1">
                    {format(new Date(r.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                  </span>
                  <span className={`badge ${r.status === 'present' ? 'badge-present' : r.status === 'absent' ? 'badge-absent' : 'badge-late'}`}>
                    {r.status === 'present' ? '✅' : r.status === 'absent' ? '❌' : '⏳'} {r.status}
                  </span>
                  {r.reason && <span className="text-xs text-slate-400">{r.reason}</span>}
                  <span className="text-xs text-slate-500">{r.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning: Only show if real data AND genuinely low */}
        {showWarning && (
          <div className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.2)' }}>
                ⚠️
              </div>
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Low Attendance Warning</h3>
                <p className="text-sm text-slate-400">
                  Attendance is below 75%. You need at least 75% to remain eligible.
                  Current: <strong className="text-red-400">{rate}%</strong> ({presentCount + lateCount} of {totalDays} days)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
