import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const result = login(email, password, role);
    if (result.success) {
      toast.success(`Welcome back! 👋`);
    } else {
      toast.error(result.msg);
      setLoading(false);
    }
  };

  const fillDemo = () => {
    if (role === 'admin') {
      setEmail('admin@technoskill.com');
      setPassword('admin123');
    } else {
      setEmail('aarav@student.com');
      setPassword('pass123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0d1f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-glow mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">Technoskill</h1>
          <p className="text-slate-400 mt-1 text-sm">Attendance Management System</p>
        </div>

        {/* Role Toggle */}
        <div className="glass-card p-1 flex mb-6 rounded-2xl">
          {['admin', 'student'].map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setEmail(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                ${role === r ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
            >
              {r === 'admin' ? <Shield className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              {r === 'admin' ? 'Admin / Teacher' : 'Student'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-1">
            {role === 'admin' ? 'Admin Login' : 'Student Login'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {role === 'admin' ? 'Manage students and attendance' : 'View your attendance records'}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email" required
                className="input-field"
                placeholder={role === 'admin' ? 'admin@technoskill.com' : 'student@email.com'}
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : `Sign In as ${role === 'admin' ? 'Admin' : 'Student'}`}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/8">
            <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Demo Credentials</p>
            {role === 'admin' ? (
              <p className="text-xs text-slate-300">Email: <span className="text-purple-400">admin@technoskill.com</span> | Pass: <span className="text-purple-400">admin123</span></p>
            ) : (
              <p className="text-xs text-slate-300">Email: <span className="text-purple-400">aarav@student.com</span> | Pass: <span className="text-purple-400">pass123</span></p>
            )}
            <button onClick={fillDemo} className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
              Auto-fill credentials
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 Technoskill · Premium Attendance Management
        </p>
      </div>
    </div>
  );
}
