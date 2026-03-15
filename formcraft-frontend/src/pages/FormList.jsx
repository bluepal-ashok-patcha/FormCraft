import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  BarChart2, 
  Power, 
  Calendar, 
  Clock, 
  AlertCircle,
  Share2,
  Check,
  Plus,
  Eye,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: '', form: null, value: '' });
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (slug, id) => {
    const link = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms?page=0&size=100');
      // ApiResponse.data contains the Page object, we need page.content
      setForms(response.data.content || []);
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/forms/${id}/toggle-status`);
      fetchForms();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredForms = forms.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-default"></div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* 🛡️ ELITE COMMAND HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 rounded-enterprise p-6 md:p-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-brand-default/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-brand-default/5 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-14 h-14 bg-brand-default rounded-2xl flex items-center justify-center shadow-lg shadow-brand-default/20 shrink-0">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter mb-1 leading-none uppercase">
                Form Intelligence <span className="text-brand-500 text-sm ml-2">// CONTROL</span>
              </h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">
                Deployment Registry & Lifecycle Monitor
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Filter registry..." 
                className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-brand-default w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate('/builder')}
              className="px-6 bg-brand-default text-white h-11 rounded-lg font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10 active:scale-95"
            >
              <Plus size={16} />
              Register New Form
            </button>
          </div>
        </div>
      </motion.div>

      {/* 📊 ANALYTIC CHIPS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Registry', value: forms.length, icon: FileText, color: 'blue' },
          { label: 'Active Signals', value: forms.filter(f => f.active).length, icon: Power, color: 'emerald' },
          { label: 'Form Responses', value: forms.reduce((acc, f) => acc + (f.responseCount || 0), 0), icon: BarChart2, color: 'orange' },
          { label: 'Success Rate', value: '100%', icon: Check, color: 'purple' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 p-5 rounded-enterprise shadow-sm flex items-center gap-5 group hover:border-brand-default/30 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-${stat.color === 'blue' ? 'blue' : stat.color === 'emerald' ? 'emerald' : stat.color === 'orange' ? 'orange' : 'purple'}-500/10 text-${stat.color === 'blue' ? 'blue' : stat.color === 'emerald' ? 'emerald' : stat.color === 'orange' ? 'orange' : 'purple'}-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🕹️ ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredForms.map((form, idx) => {
            const now = new Date();
            const isExpired = form.expiresAt && new Date(form.expiresAt) < now;
            const isFuture = form.startsAt && new Date(form.startsAt) > now;
            const isActive = form.active && !isExpired && !isFuture;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
                key={form.id}
                className={`group bg-white rounded-enterprise border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:border-brand-default/20 transition-all duration-500 flex flex-col h-full overflow-hidden relative ${!isActive ? 'opacity-80' : ''}`}
              >
                {/* 🛰️ CARD TOP COMMANDER */}
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 ${isActive ? 'bg-brand-50 text-brand-default border border-brand-100/50 shadow-sm shadow-brand-default/10' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                         <FileText size={24} strokeWidth={1.5} />
                       </div>
                       {isActive && (
                         <div className="absolute -inset-2 bg-brand-default/10 rounded-full blur-xl animate-pulse" />
                       )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                       <div className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                       </div>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Node: {form.slug.slice(0, 4)}...</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-loose transition-colors group-hover:text-brand-default">{form.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
                       <ShieldCheck size={10} className="text-brand-default/40" />
                       Endpoint Architecture // v2.0
                    </p>
                  </div>

                  {/* READOUT GRID */}
                  <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-50 rounded-xl overflow-hidden mb-6 group-hover:border-slate-200 transition-colors">
                    <div className="bg-white p-4">
                       <div className="flex items-center gap-2 mb-2">
                          <BarChart2 size={10} className="text-slate-300" />
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Responses</p>
                       </div>
                       <p className="text-2xl font-black text-slate-900 leading-none">{form.responseCount || 0}</p>
                    </div>
                    <div className="bg-white p-4">
                       <div className="flex items-center gap-2 mb-2">
                          <Clock size={10} className="text-slate-300" />
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Initialized</p>
                       </div>
                       <p className="text-[10px] font-black text-slate-900 uppercase mt-2.5">
                          {new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                       </p>
                    </div>
                  </div>
                </div>

                {/* CONTROL PANEL FOOTER */}
                <div className="mt-auto px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center gap-4">
                  <button 
                    onClick={() => navigate(`/forms/${form.id}/responses`)}
                    className="flex-1 h-10 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2 hover:border-brand-default hover:text-brand-default hover:bg-white transition-all shadow-sm active:scale-95"
                  >
                    Analysis
                  </button>
                  
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                    <button 
                      onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-default hover:bg-brand-50 transition-all"
                      title="Uplink"
                    >
                      <Eye size={14} />
                    </button>
                    <div className="w-px h-4 bg-slate-100" />
                    <button 
                       onClick={() => handleToggleStatus(form.id)}
                       className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${form.active ? 'text-emerald-500 bg-emerald-50/50' : 'text-slate-300 hover:bg-slate-50'}`}
                       title="Signal Power"
                    >
                       <Power size={14} />
                    </button>
                    <button 
                       onClick={() => handleCopyLink(form.slug, form.id)}
                       className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${copiedId === form.id ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-brand-default hover:bg-brand-50'}`}
                       title="Clone Link"
                    >
                       {copiedId === form.id ? <Check size={14} /> : <Share2 size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredForms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-enterprise">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Registry Empty // Awaiting Signal</p>
        </div>
      )}
    </div>
  );
};

export default FormList;
