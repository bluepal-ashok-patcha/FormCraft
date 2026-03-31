import { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Users, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ExternalLink,
  ClipboardList,
  Ghost,
  ShieldAlert,
  History,
  Layout,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const StatChip = ({ icon: Icon, label, value, trend, colorClass, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={onClick}
    className={`bg-white border border-slate-100 p-4 rounded-enterprise shadow-[0_2px_10px_-3px_rgba(0,0,0,0.04)] flex items-center gap-4 group transition-all h-24 ${onClick ? 'cursor-pointer hover:border-brand-default/30 hover:shadow-md' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon size={16} className={colorClass.replace('bg-', 'text-').replace('-10', '')} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h4>
        {trend && <span className="text-[9px] font-semibold text-emerald-500 uppercase">+{trend}%</span>}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!loading) setRefreshing(true);
    try {
      const response = await api.get(`/dashboard/stats?range=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Sync Error: Could not retrieve dashboard intelligence.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-brand-50 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-brand-default rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-8">
      {/* 🛡️ ELITE COMMAND HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 rounded-enterprise py-4 px-6 md:px-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-brand-default/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-brand-default/5 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter mb-1 leading-none uppercase italic">
              Form Intelligence // <span className="text-brand-500">CONTROL</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-widest opacity-80">
              Form Management & Activity Monitor
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => navigate('/builder')}
              className="px-6 bg-brand-default text-white h-10 rounded-md font-semibold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10"
            >
              <Plus size={12} />
              Initialize
            </button>
          </div>
        </div>
      </motion.div>

      {/* 📊 ANALYTIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatChip 
          label="Total Forms" 
          value={stats?.totalForms || 0} 
          icon={FileText} 
          colorClass="bg-blue-500" 
          onClick={() => navigate('/forms')}
        />
        <StatChip 
          label={isSuperAdmin ? "Total Templates" : "Total Drafts"} 
          value={isSuperAdmin ? stats?.totalTemplates : stats?.totalDrafts || 0} 
          icon={isSuperAdmin ? Layout : History} 
          colorClass="bg-amber-500" 
          onClick={() => isSuperAdmin ? navigate('/templates') : navigate('/builder', { state: { showDrafts: true } })}
        />
        <StatChip 
          label="Currently Live" 
          value={stats?.activeForms || 0} 
          icon={Activity} 
          colorClass="bg-emerald-500" 
          onClick={() => navigate('/forms', { state: { filter: 'active' } })}
        />
        <StatChip 
          label={isSuperAdmin ? "Pending Promotions" : "Expiry Soon (24h)"} 
          value={isSuperAdmin ? stats?.pendingPromotions : stats?.expiringSoon || 0} 
          icon={isSuperAdmin ? Sparkles : ShieldAlert} 
          colorClass="bg-rose-500" 
          onClick={() => navigate(isSuperAdmin ? '/templates' : '/forms', { state: { filter: isSuperAdmin ? 'requested' : 'expiring' } })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* 📈 PERFORMANCE CORE */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 bg-white rounded-enterprise border border-slate-100 shadow-sm p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 size={14} />
                </div>
                Submission Trends
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2 tracking-tighter">Response volume over time</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Range Toggle */}
              <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-lg">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-[9px] font-semibold uppercase tracking-widest rounded-md transition-all ${
                      timeRange === range 
                        ? 'bg-white text-brand-default shadow-sm border border-slate-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-100">
                <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[9px] font-semibold text-slate-500 uppercase">{refreshing ? 'Refining' : 'Live Feed'}</span>
              </div>
            </div>
          </div>

          <div className={`flex-1 min-h-[400px] transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="submissionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.05}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '12px 16px',
                    backgroundColor: '#fff'
                  }} 
                  itemStyle={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#submissionGrad)" 
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 🕹️ TACTICAL ACTION LIST */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-enterprise shadow-2xl p-8 flex flex-col h-full"
        >
          {isSuperAdmin ? (
            // SUPER ADMIN: PROMOTION REQUESTS
            <>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-widest leading-none">
                    Promotion <span className="text-brand-default">Requests</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1.5 tracking-widest opacity-60">
                    Awaiting Business Certification
                  </p>
                </div>
                <div className="w-9 h-9 bg-brand-default/10 rounded-xl flex items-center justify-center text-brand-default border border-brand-default/20">
                  <Sparkles size={16} />
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {(stats?.promotionRequests || []).length > 0 ? (
                  stats.promotionRequests.map((req, idx) => (
                    <div key={idx} className="flex gap-5 group relative">
                      {idx !== (stats.promotionRequests.length - 1) && (
                        <div className="absolute left-[17px] top-10 bottom-[-24px] w-[1px] bg-slate-800 transition-colors group-hover:bg-brand-default/20" />
                      )}
                      
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 bg-brand-default/5 text-brand-default group-hover:border-brand-default/30 transition-all z-10 relative overflow-hidden">
                        <Layout size={14} />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[11px] font-semibold text-slate-200 leading-tight group-hover:text-brand-default transition-colors uppercase tracking-tight">{req.name}</p>
                          <span className="shrink-0 text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-800">
                            {req.timeAgo}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1.5 line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">Request from: {req.requester}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <button 
                            onClick={() => navigate('/templates')}
                            className="flex items-center gap-1.5 text-[9px] font-bold text-brand-default uppercase tracking-widest hover:underline transition-all"
                          >
                            <Zap size={10} />
                            Approve Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
                    <CheckCircle2 size={40} className="mb-4" />
                    <p className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">Governance Clear</p>
                    <p className="text-[8px] text-white mt-2">No pending certifications</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/templates')}
                className="mt-8 w-full py-4 border border-slate-800 rounded-md text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all font-bold"
              >
                Go to Template Hub
              </button>
            </>
          ) : (
            // REGULAR USER: URGENT EXPIRY
            <>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-widest leading-none">
                    Urgent <span className="text-rose-500">Expiry</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1.5 tracking-widest opacity-60">
                    Action Required // Next 24h
                  </p>
                </div>
                <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                  <ShieldAlert size={16} />
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {(stats?.expiringForms || []).length > 0 ? (
                  stats.expiringForms.map((form, idx) => (
                    <div key={idx} className="flex gap-5 group relative">
                      {idx !== (stats.expiringForms.length - 1) && (
                        <div className="absolute left-[17px] top-10 bottom-[-24px] w-[1px] bg-slate-800 transition-colors group-hover:bg-rose-500/20" />
                      )}
                      
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 bg-rose-500/5 text-rose-400 group-hover:border-rose-500/30 transition-all z-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Clock size={14} />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[11px] font-semibold text-slate-200 leading-tight group-hover:text-rose-400 transition-colors uppercase tracking-tight">{form.name}</p>
                          <span className="shrink-0 text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            {form.timeLeft}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1.5 line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">This form will deactivate automatically.</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <button 
                            onClick={() => navigate(`/forms`)}
                            className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-default transition-colors"
                          >
                            <ExternalLink size={10} />
                            Extend Life
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
                    <Ghost size={40} className="mb-4" />
                    <p className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">All Sector Secure</p>
                    <p className="text-[8px] text-white mt-2">No upcoming expirations</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/forms')}
                className="mt-8 w-full py-4 border border-slate-800 rounded-md text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all"
              >
                Review All Assets
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
