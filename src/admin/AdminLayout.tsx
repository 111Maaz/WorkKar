import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Back to Dashboard', path: '/' },
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 w-64 bg-card border-r p-4 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-64`}>
        <div className="flex items-center justify-between mb-8 md:hidden">
          <span className="text-xl font-bold">Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="text-foreground"><X size={24} /></button>
        </div>
        <nav className="flex flex-col gap-4">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className="px-3 py-2 rounded hover:bg-muted text-foreground font-medium">
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-red-600 font-medium mt-4">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
        <header className="flex items-center justify-between p-4 border-b bg-card md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground"><Menu size={24} /></button>
          <span className="text-lg font-bold">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 