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
  Ghost
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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

const StatChip = ({ icon: Icon, label, value, trend, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white border border-slate-100 p-4 rounded-enterprise shadow-[0_2px_10px_-3px_rgba(0,0,0,0.04)] flex items-center gap-4 group hover:border-brand-default/30 transition-all hover:shadow-md h-24"
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
              Deployment Registry & Lifecycle Monitor
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="hidden lg:flex gap-4 mr-4 border-r border-slate-800 pr-8">
              <div className="text-center">
                <p className="text-[8px] font-semibold text-slate-500 uppercase mb-0.5">Responses Today</p>
                <p className="text-sm font-bold text-white">{stats?.responsesToday || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-semibold text-slate-500 uppercase mb-0.5">Active Load</p>
                <p className="text-sm font-bold text-white">{Math.round(stats?.submissionRate || 0)}%</p>
              </div>
            </div>
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
        <StatChip label="Total Forms" value={stats?.totalForms || 0} icon={FileText} colorClass="bg-blue-500" />
        <StatChip label="Total Responses" value={stats?.totalResponses || 0} icon={ClipboardList} colorClass="bg-emerald-500" />
        <StatChip label="Active Forms" value={stats?.activeForms || 0} icon={Activity} colorClass="bg-brand-500" />
        <StatChip label="Completion Rate" value={`${Math.round(stats?.submissionRate || 0)}%`} icon={TrendingUp} colorClass="bg-brand-500" />
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

        {/* 🕹️ COMMAND FEED */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-enterprise shadow-2xl p-8 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest leading-none">
                Recent <span className="text-brand-default">Activity</span>
              </h3>
              <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1.5 tracking-widest opacity-60">
                Latest system events registry
              </p>
            </div>
            <div className="w-9 h-9 bg-brand-default/10 rounded-xl flex items-center justify-center text-brand-default border border-brand-default/20">
              <Activity size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
            {(stats?.recentActivity || []).length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex gap-5 group relative">
                  {/* Connector Line */}
                  {idx !== (stats.recentActivity.length - 1) && (
                    <div className="absolute left-[17px] top-10 bottom-[-24px] w-[1px] bg-slate-800 transition-colors group-hover:bg-brand-default/20" />
                  )}
                  
                  {/* Icon Node */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 transition-all z-10 relative overflow-hidden ${
                    activity.type === 'FORM_CREATED' 
                      ? 'bg-blue-500/5 text-blue-400 group-hover:border-blue-500/30' 
                      : 'bg-emerald-500/5 text-emerald-400 group-hover:border-emerald-500/30'
                  }`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {activity.type === 'FORM_CREATED' ? <Plus size={14} /> : <CheckCircle2 size={14} />}
                  </div>

                  {/* Content Payload */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[11px] font-semibold text-slate-200 leading-tight group-hover:text-brand-default transition-colors uppercase tracking-tight">{activity.title}</p>
                      <span className="shrink-0 text-[8px] font-semibold text-slate-600 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-800/50">
                        {activity.type === 'FORM_CREATED' ? 'System' : 'Signal'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5 line-clamp-1 opacity-80 group-hover:opacity-100 transition-opacity">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={8} />
                        <span className="text-[8px] font-semibold uppercase tracking-widest">{activity.timeAgo}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-800 rounded-full" />
                      <span className="text-[8px] font-semibold text-slate-600 uppercase tracking-widest">
                        Node: {Math.random().toString(16).slice(2, 6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
                <Ghost size={40} className="mb-4" />
                <p className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">Sector Clear</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/forms')}
            className="mt-8 w-full py-4 border border-slate-800 rounded-md text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all"
          >
            Access Full Logs
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
