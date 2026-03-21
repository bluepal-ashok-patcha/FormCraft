import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { 
  LayoutDashboard, 
  PlusSquare, 
  ClipboardList, 
  LogOut, 
  ChevronRight,
  User,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  Square,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link
    to={to}
    title={collapsed ? label : ""}
    className={`${
      active 
        ? 'sidebar-link-active' 
        : 'sidebar-link'
    } transition-all duration-200 ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <div className="w-6 flex items-center justify-center shrink-0">
      <Icon size={18} className={active ? 'text-brand-default' : ''} />
    </div>
    {!collapsed && <span className="truncate ml-1">{label}</span>}
  </Link>
);

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Session Terminated: Secure signal disconnected.');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Global Navbar */}
      <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 text-slate-400 hover:text-brand-default hover:bg-brand-50 rounded-enterprise transition-all"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-default rounded-enterprise flex items-center justify-center shadow-sm shadow-brand-500/20">
              <Layers className="text-white fill-white/20" size={14} />
            </div>
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">
              FormCraft
            </h1>
          </div>
          <div className="flex items-center pl-4 border-l border-slate-100 gap-4">
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-none">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {user?.roles?.includes('ROLE_SUPER_ADMIN') ? 'Super Admin Console' : 'Admin Console'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 transition-all hover:border-brand-default hover:text-brand-default cursor-pointer">
              <User size={14} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Now correctly below Navbar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-slate-100 flex flex-col z-10 shadow-sm transition-all duration-300`}>
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} flex-1`}>
            <nav className="space-y-1">
              <SidebarLink 
                to="/dashboard" 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={location.pathname === '/dashboard'} 
                collapsed={sidebarCollapsed}
              />
              <SidebarLink 
                to="/builder" 
                icon={PlusSquare} 
                label="Form Builder" 
                active={location.pathname === '/builder'} 
                collapsed={sidebarCollapsed}
              />
              <SidebarLink 
                to="/templates" 
                icon={Sparkles} 
                label="Template Hub" 
                active={location.pathname === '/templates'} 
                collapsed={sidebarCollapsed}
              />
              <SidebarLink 
                to="/forms" 
                icon={ClipboardList} 
                label="My Forms" 
                active={location.pathname === '/forms'} 
                collapsed={sidebarCollapsed}
              />
            </nav>
          </div>

          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} mt-auto border-t border-slate-50`}>
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg font-semibold uppercase text-[10px] tracking-widest`}
            >
              <div className="w-6 flex items-center justify-center shrink-0">
                <LogOut size={18} />
              </div>
              {!sidebarCollapsed && <span className="ml-1">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto relative bg-slate-50 ${location.pathname === '/builder' ? 'p-0' : 'p-6'}`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
