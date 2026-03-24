import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function Navbar({ title, subtitle }) {
  const { user, logout, notifications, markNotificationRead, unreadCount, sidebarOpen } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-20 flex items-center gap-4 px-6 
        bg-[#0f0d1f]/80 backdrop-blur-lg border-b border-white/8 transition-all duration-300
        ${sidebarOpen ? 'left-64' : 'left-20'}`}
    >
      <div className="flex-1">
        <h2 className="text-lg font-bold font-display text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-72 focus-within:border-purple-500/40 transition-all">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search students, batches..."
          className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="hidden lg:block text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-white/3 border border-white/8">
        {format(new Date(), 'EEE, MMM d, yyyy')}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 glass-card p-4 animate-fade-in" style={{ zIndex: 100 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              <span className="text-xs text-purple-400">{unreadCount} new</span>
            </div>
            <div className="space-y-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${n.read ? 'opacity-50' : 'border border-purple-500/20 bg-purple-500/5'}`}
                >
                  <p className="text-sm text-slate-200">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 cursor-pointer group" onClick={logout}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
          {user?.avatar || user?.name?.[0] || 'U'}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-white leading-tight">{user?.name?.split(' ')[0]}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
        </div>
        <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors ml-1" />
      </div>
    </header>
  );
}
