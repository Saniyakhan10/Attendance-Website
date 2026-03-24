import { createContext, useContext, useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';

const AppContext = createContext(null);

// ── Data Version — bump this to auto-wipe old localStorage ─────────────────
const DATA_VERSION = 'v3_overall_rate';

// ── Seed Data ────────────────────────────────────────────────────────────────
const SEED_BATCHES = [
  {
    id: 'b1',
    name: 'Web Development',
    description: 'Full-stack Web Development Course',
    mentor: 'Sanket Rahangdale',
    time: '10:00 AM',
    days: 'Mon-Tue-Wed-Thu-Fri',
    color: 'purple',
  },
];

const SEED_STUDENTS = [
  { id: 's1',  name: 'Saniya',   email: 'saniya@student.com',   rollNo: 'WD001', batchId: 'b1', phone: '', avatar: 'SA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's2',  name: 'Payal',    email: 'payal@student.com',    rollNo: 'WD002', batchId: 'b1', phone: '', avatar: 'PA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's3',  name: 'Pratima',  email: 'pratima@student.com',  rollNo: 'WD003', batchId: 'b1', phone: '', avatar: 'PR', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's4',  name: 'Raveena',  email: 'raveena@student.com',  rollNo: 'WD004', batchId: 'b1', phone: '', avatar: 'RA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's5',  name: 'Aditi',    email: 'aditi@student.com',    rollNo: 'WD005', batchId: 'b1', phone: '', avatar: 'AD', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's6',  name: 'Rohini',   email: 'rohini@student.com',   rollNo: 'WD006', batchId: 'b1', phone: '', avatar: 'RO', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's7',  name: 'Bhumika',  email: 'bhumika@student.com',  rollNo: 'WD007', batchId: 'b1', phone: '', avatar: 'BH', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's8',  name: 'Dolly',    email: 'dolly@student.com',    rollNo: 'WD008', batchId: 'b1', phone: '', avatar: 'DO', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's9',  name: 'Bholisha', email: 'bholisha@student.com', rollNo: 'WD009', batchId: 'b1', phone: '', avatar: 'BL', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's10', name: 'Adarsh',   email: 'adarsh@student.com',   rollNo: 'WD010', batchId: 'b1', phone: '', avatar: 'AR', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's11', name: 'Kunal',    email: 'kunal@student.com',    rollNo: 'WD011', batchId: 'b1', phone: '', avatar: 'KU', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's12', name: 'Yatin',    email: 'yatin@student.com',    rollNo: 'WD012', batchId: 'b1', phone: '', avatar: 'YA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's13', name: 'Kanak',    email: 'kanak@student.com',    rollNo: 'WD013', batchId: 'b1', phone: '', avatar: 'KA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's14', name: 'Damendra', email: 'damendra@student.com', rollNo: 'WD014', batchId: 'b1', phone: '', avatar: 'DA', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's15', name: 'Pramod',   email: 'pramod@student.com',   rollNo: 'WD015', batchId: 'b1', phone: '', avatar: 'PM', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's16', name: 'Pratik',   email: 'pratik@student.com',   rollNo: 'WD016', batchId: 'b1', phone: '', avatar: 'PK', joinDate: '2026-03-01', password: 'pass123' },
  { id: 's17', name: 'Sumit',    email: 'sumit@student.com',    rollNo: 'WD017', batchId: 'b1', phone: '', avatar: 'SU', joinDate: '2026-03-01', password: 'pass123' },
];

// No past attendance — starts fresh
const SEED_ATTENDANCE = {};

export function AppProvider({ children }) {
  // ── Auto-clear stale localStorage on data version change ─────────────────
  useEffect(() => {
    const savedVersion = localStorage.getItem('ts_data_version');
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem('ts_students');
      localStorage.removeItem('ts_batches');
      localStorage.removeItem('ts_attendance');
      localStorage.removeItem('ts_user');
      localStorage.setItem('ts_data_version', DATA_VERSION);
    }
  }, []);

  const [user, setUser] = useState(() => {
    const ver = localStorage.getItem('ts_data_version');
    if (ver !== DATA_VERSION) return null;
    const saved = localStorage.getItem('ts_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState(() => {
    const ver = localStorage.getItem('ts_data_version');
    if (ver !== DATA_VERSION) return SEED_STUDENTS;
    const saved = localStorage.getItem('ts_students');
    return saved ? JSON.parse(saved) : SEED_STUDENTS;
  });

  const [batches, setBatches] = useState(() => {
    const ver = localStorage.getItem('ts_data_version');
    if (ver !== DATA_VERSION) return SEED_BATCHES;
    const saved = localStorage.getItem('ts_batches');
    return saved ? JSON.parse(saved) : SEED_BATCHES;
  });

  const [attendance, setAttendance] = useState(() => {
    const ver = localStorage.getItem('ts_data_version');
    if (ver !== DATA_VERSION) return SEED_ATTENDANCE;
    const saved = localStorage.getItem('ts_attendance');
    return saved ? JSON.parse(saved) : SEED_ATTENDANCE;
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'Web Development batch is ready! Mark today\'s attendance.', time: 'Just now', read: false },
    { id: 2, type: 'info', message: 'Welcome to Technoskill · Mentor: Sanket Rahangdale', time: 'Just now', read: false },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persist
  useEffect(() => { localStorage.setItem('ts_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('ts_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('ts_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => {
    if (user) localStorage.setItem('ts_user', JSON.stringify(user));
    else localStorage.removeItem('ts_user');
  }, [user]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const login = (email, password, role) => {
    if (role === 'admin') {
      if (email === 'admin@technoskill.com' && password === 'admin123') {
        const u = { id: 'admin1', name: 'Admin User', email, role: 'admin', avatar: 'AU' };
        setUser(u);
        return { success: true };
      }
      return { success: false, msg: 'Invalid admin credentials' };
    } else {
      const found = students.find(s => s.email === email && s.password === password);
      if (found) {
        setUser({ ...found, role: 'student' });
        return { success: true };
      }
      return { success: false, msg: 'Invalid student credentials' };
    }
  };

  const logout = () => setUser(null);

  // ── Students ──────────────────────────────────────────────────────────────
  const addStudent = (data) => {
    const id = 's' + Date.now();
    setStudents(prev => [...prev, { ...data, id, avatar: data.name.split(' ').map(n=>n[0]).join('').toUpperCase() }]);
  };
  const updateStudent = (id, data) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // ── Batches ───────────────────────────────────────────────────────────────
  const addBatch = (data) => {
    const id = 'b' + Date.now();
    setBatches(prev => [...prev, { ...data, id }]);
  };
  const updateBatch = (id, data) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };
  const deleteBatch = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  // ── Attendance ────────────────────────────────────────────────────────────
  const markAttendance = (date, studentId, status, reason = '', time = '') => {
    const key = `${date}_${studentId}`;
    setAttendance(prev => ({
      ...prev,
      [key]: { studentId, date, status, reason, time: time || format(new Date(), 'hh:mm a') }
    }));
  };

  const getAttendanceForDate = (date) => {
    return Object.values(attendance).filter(a => a.date === date);
  };

  const getStudentAttendance = (studentId) => {
    return Object.values(attendance).filter(a => a.studentId === studentId);
  };

  // Calculate rate based on TOTAL working days (Mon-Fri) since join date
  const getAttendanceRate = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 0;

    // Count all weekdays (Mon-Fri) from join date to today
    const joinDate = student.joinDate ? new Date(student.joinDate + 'T00:00:00') : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!joinDate || joinDate > today) return 0;

    const allDays = eachDayOfInterval({ start: joinDate, end: today });
    // Filter only weekdays (Mon=1 to Fri=5)
    const totalWorkingDays = allDays.filter(d => {
      const day = getDay(d); // 0=Sun, 1=Mon...6=Sat
      return day >= 1 && day <= 5;
    }).length;

    if (totalWorkingDays === 0) return 0;

    const records = getStudentAttendance(studentId);
    const presentDays = records.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((presentDays / totalWorkingDays) * 100);
  };

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = getAttendanceForDate(today);
    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;
    return { total: students.length, present, absent, late, marked: todayRecords.length };
  };

  const getStudentStreak = (studentId) => {
    let streak = 0;
    let d = 0;
    while (true) {
      const date = format(subDays(new Date(), d), 'yyyy-MM-dd');
      const key = `${date}_${studentId}`;
      const rec = attendance[key];
      if (rec && (rec.status === 'present' || rec.status === 'late')) {
        streak++;
        d++;
      } else break;
    }
    return streak;
  };

  const getBatchStats = (batchId) => {
    const batchStudents = students.filter(s => s.batchId === batchId);
    if (!batchStudents.length) return { avg: 0, count: batchStudents.length };
    const avg = Math.round(batchStudents.reduce((acc, s) => acc + getAttendanceRate(s.id), 0) / batchStudents.length);
    return { avg, count: batchStudents.length };
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, login, logout,
      students, addStudent, updateStudent, deleteStudent,
      batches, addBatch, updateBatch, deleteBatch,
      attendance, markAttendance, getAttendanceForDate,
      getStudentAttendance, getAttendanceRate, getTodayStats,
      getStudentStreak, getBatchStats,
      notifications, markNotificationRead, unreadCount,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
