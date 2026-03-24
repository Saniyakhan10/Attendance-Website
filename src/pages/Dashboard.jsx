import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Users, UserCheck, UserX, Clock, TrendingUp, Award, AlertTriangle, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
  return (
    <div className={`stat-card group cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}
          style={{ background: gradient }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">Today</span>
      </div>
      <div className="text-3xl font-bold font-display text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      {sub && <div className="text-xs mt-2 text-slate-500">{sub}</div>}
      <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-5 -m-4"
        style={{ background: gradient }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { getTodayStats, students, batches, getAttendanceRate, getAttendanceForDate, getBatchStats } = useApp();
  const navigate = useNavigate();
  const stats = getTodayStats();

  // Weekly trend
  const weeklyData = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map(day => {
    const date = format(day, 'yyyy-MM-dd');
    const records = getAttendanceForDate(date);
    return {
      day: format(day, 'EEE'),
      Present: records.filter(r => r.status === 'present').length,
      Late: records.filter(r => r.status === 'late').length,
      Absent: records.filter(r => r.status === 'absent').length,
    };
  });

  // Monthly trend (last 30 days, weekly buckets)
  const monthlyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = subDays(new Date(), (3 - i) * 7 + 6);
    const weekEnd = subDays(new Date(), (3 - i) * 7);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const all = days.flatMap(d => getAttendanceForDate(format(d, 'yyyy-MM-dd')));
    const total = all.length || 1;
    const presentCount = all.filter(r => r.status === 'present' || r.status === 'late').length;
    return {
      week: `Week ${i + 1}`,
      Rate: Math.round((presentCount / total) * 100),
    };
  });

  // Batch pie chart
  const batchPie = batches.map((b, i) => ({
    name: b.name,
    value: getBatchStats(b.id).count,
    color: ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b'][i % 4],
  }));

  // Attendance rate distribution
  const rateData = [
    { range: '90-100%', count: students.filter(s => getAttendanceRate(s.id) >= 90).length, color: '#10b981' },
    { range: '75-90%', count: students.filter(s => { const r = getAttendanceRate(s.id); return r >= 75 && r < 90; }).length, color: '#3b82f6' },
    { range: '60-75%', count: students.filter(s => { const r = getAttendanceRate(s.id); return r >= 60 && r < 75; }).length, color: '#f59e0b' },
    { range: 'Below 60%', count: students.filter(s => getAttendanceRate(s.id) < 60).length, color: '#ef4444' },
  ];

  // Low attendance warnings
  const lowAttendance = students.filter(s => getAttendanceRate(s.id) < 75);

  // Top students
  const topStudents = [...students]
    .sort((a, b) => getAttendanceRate(b.id) - getAttendanceRate(a.id))
    .slice(0, 5);

  const attPercent = stats.marked > 0 ? Math.round((stats.present / stats.marked) * 100) : 0;

  return (
    <Layout title="Dashboard" subtitle={`Welcome back! Here's what's happening today.`}>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users} label="Total Students" value={stats.total}
            gradient="linear-gradient(135deg,#7c3aed,#3b82f6)"
            sub={`${batches.length} active batches`}
          />
          <StatCard
            icon={UserCheck} label="Present Today" value={stats.present}
            gradient="linear-gradient(135deg,#10b981,#06b6d4)"
            sub={`${attPercent}% attendance rate`}
          />
          <StatCard
            icon={UserX} label="Absent Today" value={stats.absent}
            gradient="linear-gradient(135deg,#ef4444,#dc2626)"
            sub={stats.marked > 0 ? `${Math.round((stats.absent / stats.marked) * 100)}% of marked` : 'Not marked yet'}
          />
          <StatCard
            icon={Clock} label="Late Entries" value={stats.late}
            gradient="linear-gradient(135deg,#f59e0b,#f97316)"
            sub={stats.marked > 0 ? `${Math.round((stats.late / stats.marked) * 100)}% punctuality issue` : ''}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly Area Chart */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Weekly Attendance Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 7 days overview</p>
              </div>
              <div className="flex gap-3 text-xs">
                {[{ c: '#10b981', l: 'Present' }, { c: '#f59e0b', l: 'Late' }, { c: '#ef4444', l: 'Absent' }].map(x => (
                  <span key={x.l} className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: x.c }} /> {x.l}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {[['present', '#10b981'], ['late', '#f59e0b'], ['absent', '#ef4444']].map(([k, c]) => (
                    <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Present" stroke="#10b981" fill="url(#grad_present)" strokeWidth={2} />
                <Area type="monotone" dataKey="Late" stroke="#f59e0b" fill="url(#grad_late)" strokeWidth={2} />
                <Area type="monotone" dataKey="Absent" stroke="#ef4444" fill="url(#grad_absent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-1">Students by Batch</h3>
            <p className="text-xs text-slate-400 mb-4">Enrollment distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={batchPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {batchPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {batchPie.map(b => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                    <span className="text-slate-400">{b.name.split(' ').slice(0, 2).join(' ')}</span>
                  </span>
                  <span className="text-white font-semibold">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rate Bar Chart */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-1">Attendance Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Students by attendance %</p>
            <div className="space-y-3">
              {rateData.map(r => (
                <div key={r.range}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{r.range}</span>
                    <span className="text-white font-semibold">{r.count} students</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${students.length > 0 ? (r.count / students.length) * 100 : 0}%`,
                        background: r.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-1">Monthly Attendance Rate</h3>
            <p className="text-xs text-slate-400 mb-4">Weekly average %</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Rate" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${250 + i * 15}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Students */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-white">Top Students</h3>
            </div>
            <div className="space-y-3">
              {topStudents.map((s, i) => {
                const rate = getAttendanceRate(s.id);
                const batch = batches.find(b => b.id === s.batchId);
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                      #{i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">{batch?.name?.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: rate >= 90 ? '#10b981' : rate >= 75 ? '#3b82f6' : '#f59e0b' }}>
                        {rate}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Low Attendance Alerts</h3>
            <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ml-2">
              {lowAttendance.length} {lowAttendance.length === 1 ? 'student' : 'students'}
            </span>
            {lowAttendance.length > 0 && (
              <button
                onClick={() => {
                  lowAttendance.forEach(s => {
                    toast(`⚠️ Warning sent to ${s.name}`, { icon: '📩' });
                  });
                }}
                className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all font-medium"
              >
                Notify All
              </button>
            )}
          </div>
          {lowAttendance.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              ✅ All students have attendance above 75%. Great job!
            </div>
          ) : (
            <div className="space-y-2">
              {lowAttendance.map(s => {
                const rate = getAttendanceRate(s.id);
                const batch = batches.find(b => b.id === s.batchId);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 hover:bg-yellow-500/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-400">{batch?.name} · {s.rollNo}</p>
                    </div>
                    <div className="text-right mr-2 flex-shrink-0">
                      <div className="text-sm font-bold text-red-400">{rate}%</div>
                      <div className="text-xs text-slate-500">{rate < 50 ? 'Critical' : 'Low'}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate('/attendance')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                        title="Go to attendance page"
                      >
                        Mark
                      </button>
                      <button
                        onClick={() => toast(`⚠️ Warning sent to ${s.name}!`, { icon: '📩' })}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
                        title="Send attendance warning"
                      >
                        Warn
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
