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
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-black text-slate-900 tracking-tight">{value}</h4>
        {trend && <span className="text-[9px] font-black text-emerald-500 uppercase">+{trend}%</span>}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Sync Error: Could not retrieve dashboard intelligence.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        className="relative overflow-hidden bg-slate-900 rounded-enterprise p-5 md:p-6 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-brand-default/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-brand-default/5 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-2xl font-black tracking-tighter mb-1 leading-none uppercase">
              Digital Form <span className="text-brand-500">Intelligence</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-80">
              FormCraft Ecosystem <span className="mx-2 text-slate-700">|</span> Unified Response Management
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="hidden lg:flex gap-4 mr-4 border-r border-slate-800 pr-8">
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Responses Today</p>
                <p className="text-md font-black text-white">{stats?.responsesToday || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Active Forms</p>
                <p className="text-md font-black text-white">{Math.round(stats?.submissionRate || 0)}%</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/builder')}
              className="px-6 bg-brand-default text-white h-10 rounded-md font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10"
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
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 size={14} />
                </div>
                Submission Trends
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">Response volume over time</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase">Live Feed</span>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-md transition-colors text-slate-400">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                />
                <Tooltip 
                  cursor={{ stroke: '#7C3AED', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }} 
                />
                <Area 
                  type="step" 
                  dataKey="count" 
                  stroke="#7C3AED" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#velocityGrad)" 
                  animationDuration={2000}
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
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Latest system events</p>
            </div>
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              <Activity size={14} />
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
            {(stats?.recentActivity || []).length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex gap-4 group relative">
                  <div className="absolute left-[15px] top-10 bottom-[-20px] w-px bg-slate-800 last:hidden" />
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-slate-800 transition-all z-10 ${
                    activity.type === 'FORM_CREATED' 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {activity.type === 'FORM_CREATED' ? <Plus size={14} /> : <CheckCircle2 size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-slate-200 leading-tight group-hover:text-brand-500 transition-colors uppercase tracking-tight">{activity.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{activity.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-slate-600">
                      <Clock size={8} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{activity.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center grayscale">
                <Ghost size={40} className="mb-4" />
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sector Clear</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/forms')}
            className="mt-8 w-full py-4 border border-slate-800 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all"
          >
            Access Full Logs
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
