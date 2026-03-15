import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Square
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link
    to={to}
    title={collapsed ? label : ""}
    className={`${
      active 
        ? 'sidebar-link-active' 
        : 'sidebar-link'
    } transition-all duration-200`}
  >
    <div className="w-6 flex items-center justify-center shrink-0">
      <Icon size={18} className={active ? 'text-brand-default' : ''} />
    </div>
    {!collapsed && <span className="truncate ml-1">{label}</span>}
  </Link>
);

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
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
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
            <div className="w-8 h-8 bg-slate-900 rounded-enterprise flex items-center justify-center">
              <Square className="text-white fill-white" size={16} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {location.pathname === '/dashboard' ? 'Dashboard' : 
               location.pathname === '/builder' ? 'Form Architect' :
               location.pathname === '/forms' ? 'Asset Management' : 'Interface'}
            </h2>
            <div className="hidden md:flex items-center bg-slate-100/80 rounded-md px-3 py-1.5 gap-2 border border-slate-200/50">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Search data..." className="bg-transparent border-none outline-none text-xs w-48 font-medium text-slate-600 placeholder:text-slate-400" />
              <button className="bg-brand-default text-white p-1 rounded-md shadow-sm shadow-brand-500/20">
                <Search size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-brand-default transition-colors hover:bg-brand-50 rounded-md relative group">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-orange rounded-full border-2 border-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-slate-400 mt-1">Admin Console</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 transition-all hover:border-brand-default hover:text-brand-default cursor-pointer">
              <User size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Now correctly below Navbar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-slate-100 flex flex-col z-10 shadow-sm transition-all duration-300`}>
          <div className="p-4 flex-1">
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
                to="/forms" 
                icon={ClipboardList} 
                label="My Forms" 
                active={location.pathname === '/forms'} 
                collapsed={sidebarCollapsed}
              />
            </nav>
          </div>

          <div className="p-4 mt-auto border-t border-slate-50">
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg font-bold uppercase text-[10px] tracking-widest`}
            >
              <div className="w-6 flex items-center justify-center shrink-0">
                <LogOut size={18} />
              </div>
              {!sidebarCollapsed && <span className="ml-1">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 relative bg-slate-50">
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
