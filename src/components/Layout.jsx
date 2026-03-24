import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';

export default function Layout({ children, title, subtitle }) {
  const { sidebarOpen } = useApp();
  return (
    <div className="min-h-screen bg-[#0f0d1f] flex">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Navbar title={title} subtitle={subtitle} />
        <main className="flex-1 pt-16 p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
