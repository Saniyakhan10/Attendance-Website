import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck, BarChart3,
  LogOut, ChevronLeft, ChevronRight, GraduationCap, Trophy, Bell
} from 'lucide-react';

const ADMIN_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/students', icon: Users, label: 'Students' },
  { path: '/batches', icon: BookOpen, label: 'Batches' },
  { path: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const STUDENT_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/my-attendance', icon: CalendarCheck, label: 'My Attendance' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, sidebarOpen, setSidebarOpen, unreadCount } = useApp();
  const [showLogout, setShowLogout] = useState(false);

  const nav = user?.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300
        bg-[#12102a] border-r border-white/8 sidebar-glow
        ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/8 ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-glow">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="font-bold font-display text-white leading-tight">Technoskill</h1>
            <p className="text-xs text-slate-500">Attendance System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={!sidebarOpen ? label : ''}
              className={`sidebar-item w-full ${active ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-purple-400' : ''}`} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && label === 'Dashboard' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/8 pt-3">
        <div
          onClick={() => setShowLogout(!showLogout)}
          className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.avatar || user?.name?.[0] || 'U'}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        {showLogout && sidebarOpen && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm mt-1"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-purple-600 border border-purple-500 flex items-center justify-center text-white shadow-glow hover:bg-purple-500 transition-all"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
