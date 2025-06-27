import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Back to Home', path: '/' },
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Workers', path: '/admin/workers' },
  { label: 'Reviews', path: '/admin/reviews' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Audit Logs', path: '/admin/audit-log' },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session and redirect to login
    localStorage.clear();
    navigate('/auth');
    window.location.reload();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 w-64 max-w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-r p-4 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 rounded-r-3xl md:rounded-none`}>
        <div className="flex items-center justify-between mb-8 md:hidden">
          <span className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="text-foreground"><X size={24} /></button>
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setSidebarOpen(false)}
              className="px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 dark:hover:from-gray-800 dark:hover:to-gray-900 hover:shadow-md hover:scale-[1.03] text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 hover:shadow-md hover:scale-[1.03] text-red-600 font-medium mt-4">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Main content */}
      <div className="flex-1 flex flex-col w-full">
        <header className="flex items-center justify-between p-4 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-md md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu size={24} /></button>
          <span className="text-lg font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 