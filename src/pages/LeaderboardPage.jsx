import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Trophy, Medal, Star, Flame, Award, Crown, Users } from 'lucide-react';

function getBadges(rate, streak, totalDays) {
  if (totalDays === 0) return [];
  const badges = [];
  if (rate >= 95) badges.push({ icon: '🏆', label: 'Perfect Attendance', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' });
  if (rate >= 80 && rate < 95) badges.push({ icon: '⭐', label: 'Star Student', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' });
  if (streak >= 10) badges.push({ icon: '🔥', label: `${streak}-Day Streak`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' });
  if (streak >= 20) badges.push({ icon: '💎', label: 'Consistency King', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' });
  if (rate >= 75 && rate < 80) badges.push({ icon: '📈', label: 'On Track', color: 'text-green-400 bg-green-500/10 border-green-500/20' });
  return badges;
}

function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
  return <span className="text-slate-500 font-bold text-sm w-5 text-center">#{rank}</span>;
}

export default function LeaderboardPage() {
  const { students, batches, getAttendanceRate, getStudentStreak, getBatchStats, getStudentAttendance } = useApp();

  const ranked = [...students]
    .map(s => {
      const records = getStudentAttendance(s.id);
      const rate = getAttendanceRate(s.id);
      const streak = getStudentStreak(s.id);
      return {
        ...s,
        rate,
        streak,
        totalDays: records.length,
        badges: getBadges(rate, streak, records.length),
      };
    })
    // Sort: if no data yet, put all at equal rank; else sort by rate desc, then streak desc
    .sort((a, b) => b.rate - a.rate || b.streak - a.streak);

  const hasAnyAttendance = ranked.some(s => s.totalDays > 0);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const batchRanked = [...batches]
    .map(b => ({ ...b, ...getBatchStats(b.id) }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <Layout title="Leaderboard" subtitle="Top performing students & batch rankings">
      <div className="space-y-6">

        {/* Podium */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold font-display gradient-text">Hall of Fame</h2>
            <p className="text-slate-400 text-sm mt-1">
              {hasAnyAttendance ? 'Top performing students this period' : 'Rankings will appear once attendance is marked'}
            </p>
          </div>

          {!hasAnyAttendance ? (
            /* Empty podium placeholder */
            <div className="flex items-end justify-center gap-4">
              {[2, 1, 3].map(pos => (
                <div key={pos} className="text-center flex-1 max-w-[180px]">
                  <div className={`w-${pos === 1 ? 20 : 16} h-${pos === 1 ? 20 : 16} rounded-2xl mx-auto mb-3 flex items-center justify-center`}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', width: pos === 1 ? 80 : 64, height: pos === 1 ? 80 : 64 }}>
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-600 text-xs">{pos === 1 ? '1st Place' : pos === 2 ? '2nd Place' : '3rd Place'}</p>
                  <div className={`mt-2 rounded-t-xl`}
                    style={{ height: pos === 1 ? 80 : pos === 2 ? 56 : 36, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }} />
                </div>
              ))}
            </div>
          ) : top3.length >= 3 ? (
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="text-center flex-1 max-w-[180px]">
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-xl font-bold text-white mx-auto shadow-lg">
                    {top3[1].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                </div>
                <p className="text-sm font-semibold text-white">{top3[1].name}</p>
                <p className="text-slate-400 font-bold text-lg">{top3[1].totalDays > 0 ? `${top3[1].rate}%` : '—'}</p>
                <div className="h-14 bg-slate-500/20 border border-slate-500/30 rounded-t-xl mt-2 flex items-end justify-center pb-2">
                  <Medal className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* 1st */}
              <div className="text-center flex-1 max-w-[200px]">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-glow">
                    {top3[0].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold shadow-glow">1</div>
                </div>
                <Crown className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-base font-bold text-white">{top3[0].name}</p>
                <p className="text-yellow-400 font-bold text-2xl">{top3[0].totalDays > 0 ? `${top3[0].rate}%` : '—'}</p>
                <div className="h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl mt-2 flex items-end justify-center pb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
              </div>

              {/* 3rd */}
              <div className="text-center flex-1 max-w-[180px]">
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-xl font-bold text-white mx-auto shadow-lg">
                    {top3[2].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                </div>
                <p className="text-sm font-semibold text-white">{top3[2].name}</p>
                <p className="text-orange-400 font-bold text-lg">{top3[2].totalDays > 0 ? `${top3[2].rate}%` : '—'}</p>
                <div className="h-10 bg-orange-500/10 border border-orange-500/20 rounded-t-xl mt-2 flex items-end justify-center pb-2">
                  <Star className="w-4 h-4 text-orange-400" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Full Rankings + Batch Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Full Student Rankings */}
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-semibold text-white">Full Rankings</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasAnyAttendance ? 'Sorted by attendance rate & streak' : 'Waiting for first attendance marks…'}
              </p>
            </div>
            <div>
              {ranked.map((s, i) => {
                const batch = batches.find(b => b.id === s.batchId);
                const rowClass = i === 0 ? 'leaderboard-1' : i === 1 ? 'leaderboard-2' : i === 2 ? 'leaderboard-3' : '';
                return (
                  <div key={s.id}
                    className={`flex items-center gap-3 p-4 transition-all hover:bg-white/3 border border-transparent ${rowClass}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      <RankIcon rank={i + 1} />
                    </div>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {s.avatar}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.rollNo}</p>
                      {s.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.badges.map(b => (
                            <span key={b.label} className={`badge border text-xs ${b.color}`}>{b.icon} {b.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Streak */}
                    <div className="text-center px-2 flex-shrink-0">
                      <div className="text-orange-400 font-bold text-sm flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {s.streak}
                      </div>
                      <div className="text-xs text-slate-600">streak</div>
                    </div>
                    {/* Rate */}
                    <div className="text-right flex-shrink-0 w-16">
                      <div className={`text-base font-bold font-display
                        ${s.totalDays === 0 ? 'text-slate-600'
                          : s.rate >= 90 ? 'text-green-400'
                          : s.rate >= 75 ? 'text-blue-400'
                          : s.rate >= 60 ? 'text-yellow-400'
                          : 'text-red-400'}`}>
                        {s.totalDays === 0 ? '—' : `${s.rate}%`}
                      </div>
                      <div className="w-full h-1 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-1 rounded-full"
                          style={{ width: `${s.rate}%`, background: s.totalDays === 0 ? 'rgba(255,255,255,0.1)' : s.rate >= 75 ? '#10b981' : '#ef4444' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Batch Rankings */}
            <div className="glass-card overflow-hidden">
              <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Batch Rankings
                </h3>
              </div>
              <div>
                {batchRanked.map((b, i) => (
                  <div key={b.id} className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                      <p className="text-xs text-slate-500">{b.count} students{b.mentor ? ` · ${b.mentor}` : ''}</p>
                    </div>
                    <div className={`text-sm font-bold flex-shrink-0 ${b.avg > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                      {b.avg > 0 ? `${b.avg}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge Gallery */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Badge Gallery</h3>
              <div className="space-y-3">
                {[
                  { icon: '🏆', label: 'Perfect Attendance', desc: '95%+ rate', count: ranked.filter(s => s.totalDays > 0 && s.rate >= 95).length },
                  { icon: '⭐', label: 'Star Student',       desc: '80–95% rate', count: ranked.filter(s => s.totalDays > 0 && s.rate >= 80 && s.rate < 95).length },
                  { icon: '🔥', label: '10-Day Streak',      desc: '10+ days in a row', count: ranked.filter(s => s.streak >= 10).length },
                  { icon: '📈', label: 'On Track',           desc: '75–80% rate', count: ranked.filter(s => s.totalDays > 0 && s.rate >= 75 && s.rate < 80).length },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-2xl">{b.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{b.label}</p>
                      <p className="text-xs text-slate-500">{b.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-400">{b.count}</span>
                  </div>
                ))}
              </div>

              {!hasAnyAttendance && (
                <p className="text-xs text-slate-600 text-center mt-4">Badges unlock after first attendance</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
