import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { CheckCircle, XCircle, Clock, Flame, Calendar, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user, students, batches, attendance, getAttendanceRate, getStudentAttendance, getStudentStreak } = useApp();
  const navigate = useNavigate();

  const student = students.find(s => s.id === user?.id) ?? students[0];
  if (!student) return null;

  const rate = getAttendanceRate(student.id);
  const streak = getStudentStreak(student.id);
  const records = getStudentAttendance(student.id);
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount  = records.filter(r => r.status === 'absent').length;
  const lateCount    = records.filter(r => r.status === 'late').length;
  const totalDays    = records.length;
  const batch = batches.find(b => b.id === student.batchId);

  // Trend data (last 14 days, sampled)
  const trendData = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
    .map(day => {
      const key = `${format(day, 'yyyy-MM-dd')}_${student.id}`;
      const rec = attendance[key];
      return {
        date: format(day, 'MMM d'),
        value: rec?.status === 'present' ? 1 : rec?.status === 'late' ? 0.5 : rec?.status === 'absent' ? -0.2 : 0,
        status: rec?.status || 'none',
      };
    });

  // Recent 5 records
  const recent = [...records].reverse().slice(0, 5);

  // Badges
  const badges = [];
  if (totalDays > 0 && rate >= 95)  badges.push({ icon: '🏆', label: 'Perfect Attendance', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' });
  if (streak >= 10)                 badges.push({ icon: '🔥', label: `${streak}-Day Streak`, color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' });
  if (totalDays > 0 && rate >= 80)  badges.push({ icon: '⭐', label: 'Star Student', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' });
  if (totalDays > 0 && rate >= 75 && rate < 80) badges.push({ icon: '📈', label: 'On Track', color: 'bg-green-500/15 text-green-400 border-green-500/30' });

  const rateColor = totalDays === 0 ? '#4b5563' : rate >= 75 ? '#10b981' : '#ef4444';

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${student.name}! 👋`}>
      <div className="space-y-5">

        {/* Profile + Rate Ring */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-glow flex-shrink-0">
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold font-display text-white">{student.name}</h2>
              <p className="text-slate-400 text-sm">{student.rollNo} · {batch?.name}</p>
              {batch?.mentor && <p className="text-purple-400 text-xs mt-0.5">Mentor: {batch.mentor}</p>}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {badges.map(b => (
                    <span key={b.label} className={`badge border text-xs ${b.color}`}>{b.icon} {b.label}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Rate Ring */}
            <div className="text-center flex-shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={rateColor} strokeWidth="8"
                    strokeDasharray={`${rate * 2.51} 251`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: rateColor }}>
                    {totalDays === 0 ? '—' : `${rate}%`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Overall</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CheckCircle, label: 'Present', value: presentCount, color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: XCircle,     label: 'Absent',  value: absentCount,  color: 'text-red-400',   bg: 'bg-red-500/10' },
            { icon: Clock,       label: 'Late',    value: lateCount,    color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: Flame,       label: 'Streak',  value: streak > 0 ? `${streak}d` : '0', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map(s => (
            <div key={s.label} className={`glass-card p-4 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance Trend + Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Trend Chart */}
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold text-white mb-1">Attendance Trend</h3>
            <p className="text-xs text-slate-400 mb-4">Last 14 days</p>
            {totalDays === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No attendance data yet. Your trend will appear here once attendance is marked.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[-0.5, 1.2]} tick={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [v >= 0.8 ? 'Present' : v >= 0.3 ? 'Late' : v < 0 ? 'Absent' : 'No record', 'Status']}
                    contentStyle={{ background: 'rgba(26,23,48,0.95)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#stuGrad)" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Info */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <BookOpen className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{batch?.name || 'No Batch'}</p>
                  <p className="text-xs text-slate-500">{batch?.time} · {batch?.days}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white">Attendance Status</p>
                  <p className="text-xs text-slate-500">
                    {totalDays === 0 ? 'No records yet' : rate >= 75 ? '✅ Good standing' : '⚠️ Needs improvement'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white">Leaderboard</p>
                  <p className="text-xs text-slate-500">Check your ranking</p>
                </div>
                <button onClick={() => navigate('/leaderboard')} className="text-xs text-purple-400 hover:text-purple-300">View →</button>
              </div>
            </div>

            {/* Low attendance warning */}
            {totalDays > 0 && rate < 75 && (
              <div className="mt-4 p-3 rounded-xl border border-red-500/20" style={{ background: 'rgba(239,68,68,0.05)' }}>
                <p className="text-xs text-red-300 font-medium">⚠️ Your attendance is below 75%</p>
                <p className="text-xs text-slate-500 mt-0.5">Current: {rate}% · Minimum required: 75%</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="glass-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Attendance</h3>
              <button onClick={() => navigate('/my-attendance')}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                View All →
              </button>
            </div>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No attendance records yet. Records will appear here once attendance is marked.
            </div>
          ) : (
            <div>
              {recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-sm text-slate-300 flex-1">
                    {format(new Date(r.date + 'T00:00:00'), 'EEE, MMM d')}
                  </span>
                  <span className={`badge ${r.status === 'present' ? 'badge-present' : r.status === 'absent' ? 'badge-absent' : 'badge-late'}`}>
                    {r.status === 'present' ? '✅' : r.status === 'absent' ? '❌' : '⏳'} {r.status}
                  </span>
                  <span className="text-xs text-slate-500">{r.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
