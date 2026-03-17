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
  ShieldCheck,
  Edit,
  X,
  History,
  Save,
  Filter,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
  LayoutGrid,
  List,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'all', 'active', 'inactive'
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  const [modal, setModal] = useState({ isOpen: false, type: '', form: null });
  const [editForm, setEditForm] = useState({ name: '', startsAt: '', expiresAt: '' });
  const [copiedId, setCopiedId] = useState(null);

  const [stats, setStats] = useState({ totalForms: 0, activeForms: 0, totalResponses: 0 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeMenuId, setActiveMenuId] = useState(null);

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const minDateTime = new Date(now - offset).toISOString().slice(0, 16);

  const fetchForms = async () => {
    if (!loading) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', pageSize);

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter === 'active') params.append('status', 'ACTIVE');
      if (statusFilter === 'inactive') params.append('status', 'INACTIVE');
      if (statusFilter === 'planned') params.append('status', 'PLANNED');
      if (dateRange.start) params.append('startDate', new Date(dateRange.start).toISOString());
      if (dateRange.end) params.append('endDate', new Date(dateRange.end).toISOString());
      params.append('sort', `${sortField},${sortDir}`);

      const [formsRes, statsRes] = await Promise.all([
        api.get(`/forms?${params.toString()}`),
        api.get('/dashboard/stats')
      ]);

      setForms(formsRes.data?.content || []);
      setTotalPages(formsRes.data?.totalPages || 0);
      setTotalElements(formsRes.data?.totalElements || 0);
      setStats(statsRes.data || { totalForms: 0, activeForms: 0, totalResponses: 0 });
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchForms();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, statusFilter, dateRange, sortField, sortDir]);

  const handleCopyLink = (slug, id) => {
    const link = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Link Secured: Form URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/forms/${id}/toggle-status`);
      toast.info('Status Recalibrated: Form availability has been updated.');
      fetchForms();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('System Error: Could not update form status.');
    }
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm("CRITICAL ACTION: Deleting this form will permanently remove all associated responses from the database. Portions of history will be lost. Proceed?")) {
      try {
        await api.delete(`/forms/${id}`);
        toast.success('Asset Purged: Form and history have been removed.');
        fetchForms();
      } catch (err) {
        console.error('Deletion failure:', err);
        toast.error('Purge Failed: System could not remove the asset.');
      }
    }
  };

  const openEditModal = (form) => {
    setModal({ isOpen: true, type: 'edit', form });
    setEditForm({
      name: form.name,
      startsAt: form.startsAt ? form.startsAt.split('.')[0] : '',
      expiresAt: form.expiresAt ? form.expiresAt.split('.')[0] : ''
    });
  };

  const handleUpdateForm = async () => {
    try {
      if (editForm.startsAt && editForm.expiresAt && new Date(editForm.expiresAt) <= new Date(editForm.startsAt)) {
        toast.error('Timeline Inconsistency: Expiration must follow initialization.');
        return;
      }
      await api.put(`/forms/${modal.form.id}`, {
        ...modal.form,
        name: editForm.name,
        startsAt: editForm.startsAt || null,
        expiresAt: editForm.expiresAt || null
      });
      toast.success('Asset Updated: Form parameters synchronized.');
      setModal({ isOpen: false, type: '', form: null });
      fetchForms();
    } catch (err) {
      console.error('Update failure:', err);
      toast.error('Update Interrupted: Synchronization failed.');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
    setPage(0);
  };

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
        className="relative overflow-hidden bg-slate-900 rounded-enterprise py-4 px-6 md:px-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-brand-default/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-brand-default/5 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <FileText size={16} className="text-brand-default" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tighter mb-1 leading-none uppercase italic">
                Form Intelligence // <span className="text-brand-500">CONTROL</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-widest opacity-80">
                Deployment Registry & Lifecycle Monitor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button
              onClick={() => navigate('/builder')}
              className="px-6 bg-brand-default text-white h-11 rounded-lg font-semibold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10 active:scale-95"
            >
              <Plus size={14} />
              Register New Form
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🔍 SEARCH & DEEP FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 p-4 rounded-enterprise shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or slug..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={12} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active (Live)</option>
              <option value="inactive">Inactive (Offline)</option>
              <option value="planned">Planned (Scheduled)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <History size={14} className="text-slate-400" />
            <select
              value={`${sortField},${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split(',');
                setSortField(field);
                setSortDir(dir);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all appearance-none cursor-pointer"
            >
              <option value="createdAt,desc">Latest First</option>
              <option value="createdAt,asc">Oldest First</option>
              <option value="name,asc">Name (A-Z)</option>
              <option value="name,desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setPage(0); }}
                className="bg-transparent border-none py-2 text-[10px] font-semibold text-slate-700 focus:outline-none"
              />
              <span className="text-slate-300 mx-1">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setPage(0); }}
                className="bg-transparent border-none py-2 text-[10px] font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-default shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-brand-default shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={clearFilters}
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Clear All Filters"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>

      {/* 📊 ANALYTIC CHIPS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Registry', value: stats.totalForms || totalElements, icon: FileText, color: 'blue' },
          { label: 'Active Assets', value: stats.activeForms || 0, icon: Power, color: 'emerald' },
          { label: 'Form Responses', value: stats.totalResponses || 0, icon: BarChart2, color: 'orange' },
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
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🕹️ OPERATIONAL VIEWPORT */}
      <div className={`transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {forms.map((form, idx) => {
                const status = form.status || 'INACTIVE';
                const isLive = status === 'ACTIVE';
                const isOffline = status === 'INACTIVE';

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.05 }}
                    key={form.id}
                    className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-default/30 transition-all duration-500 flex flex-col h-full overflow-hidden relative ${!isLive ? 'opacity-90' : ''}`}
                  >
                    {/* 🛰️ PREMIUM CARD HEADER */}
                    <div className="p-5 pb-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl transition-all duration-500 bg-brand-50 text-brand-default">
                          <FileText size={18} />
                        </div>
                        
                        <div className={`px-2 py-0.5 rounded-md text-[7px] font-semibold uppercase tracking-[0.2em] flex items-center gap-1.5 border shadow-sm ${isLive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            isOffline ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          <div className={`w-1 h-1 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : isOffline ? 'bg-rose-500' : 'bg-blue-500'}`} />
                          {isLive ? 'Live' : isOffline ? 'Offline' : 'Scheduled'}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-slate-800 uppercase tracking-tight mb-0.5 group-hover:text-brand-default transition-colors">{form.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <History size={10} className="text-brand-default/40" />
                            Ref: {form.slug}
                          </span>
                        </div>
                      </div>

                      {/* 📊 TELEMETRY MODULE */}
                      <div className="flex flex-col gap-2.5 mb-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-brand-default/10 transition-all duration-500 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-brand-default shadow-sm group-hover:scale-110 transition-transform">
                              <BarChart2 size={14} />
                            </div>
                            <div>
                               <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Total Submissions</p>
                               <p className="text-xl font-bold text-slate-900 leading-none">{form.responseCount || 0}</p>
                            </div>
                          </div>
                          <div className="w-1 h-6 bg-slate-100 rounded-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/50 group-hover:bg-white transition-all">
                            <div className="flex items-center gap-1.5 mb-1.5">
                               <Clock size={10} className="text-brand-default/40" />
                               <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Launch</p>
                            </div>
                            <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-tighter leading-tight">
                              {form.startsAt ? new Date(form.startsAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Immediate'}
                            </p>
                          </div>
                          <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/50 group-hover:bg-white transition-all">
                            <div className="flex items-center gap-1.5 mb-1.5">
                               <Calendar size={10} className="text-brand-default/40" />
                               <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">Expiration</p>
                            </div>
                            <p className="text-[9px] font-semibold text-slate-700 uppercase tracking-tighter leading-tight">
                              {form.expiresAt ? new Date(form.expiresAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Eternal'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONTROL PANEL FOOTER */}
                    <div className="mt-auto px-5 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/forms/${form.id}/responses`)}
                        className="px-3 py-1.5 bg-brand-50 text-brand-default border border-brand-100/50 rounded-lg flex items-center gap-1.5 transition-all group/btn hover:bg-brand-default hover:text-white"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-widest">View Responses</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>

                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === form.id ? null : form.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${activeMenuId === form.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-brand-default hover:bg-white'}`}
                          >
                            <MoreVertical size={14} />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === form.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-20" 
                                  onClick={() => setActiveMenuId(null)} 
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-30 py-2"
                                >
                                  <button
                                    onClick={() => { window.open(`/f/${form.slug}`, '_blank'); setActiveMenuId(null); }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <Eye size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Open Form</span>
                                  </button>
                                  <button
                                    onClick={() => { openEditModal(form); setActiveMenuId(null); }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <Edit size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Edit Form</span>
                                  </button>
                                  <button
                                    onClick={() => { handleToggleStatus(form.id); setActiveMenuId(null); }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <Power size={14} className={isLive ? 'text-emerald-500' : 'text-slate-400'} />
                                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{isLive ? 'Deactivate' : 'Activate'}</span>
                                  </button>
                                  <button
                                    onClick={() => { handleCopyLink(form.slug, form.id); setActiveMenuId(null); }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <Share2 size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Copy Link</span>
                                  </button>
                                  <div className="h-px bg-slate-50 my-1" />
                                  <button
                                    onClick={() => { handleDeleteForm(form.id); setActiveMenuId(null); }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-rose-50 transition-colors group"
                                  >
                                    <Trash2 size={14} className="text-rose-500" />
                                    <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest">Delete Form</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white border border-slate-100 rounded-enterprise shadow-sm overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em]">Asset Identity</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em]">Telemetry</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em]">Timeline</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-right">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {forms.map((form) => {
                    const status = form.status || 'INACTIVE';
                    const isLive = status === 'ACTIVE';
                    const isOffline = status === 'INACTIVE';

                    return (
                      <tr key={form.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className={`w-fit px-2 py-1 rounded-md text-[9px] font-semibold uppercase tracking-[0.2em] flex items-center gap-1.5 border shadow-sm ${isLive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              isOffline ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            <div className={`w-1 h-1 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : isOffline ? 'bg-rose-500' : 'bg-blue-500'}`} />
                            {isLive ? 'Live' : isOffline ? 'Offline' : 'Scheduled'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 uppercase tracking-tight group-hover:text-brand-default transition-colors">{form.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Ref: {form.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <BarChart2 size={12} className="text-brand-default" />
                             <span className="text-sm font-semibold text-slate-900">{form.responseCount || 0}</span>
                             <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Responses</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Launch</p>
                               <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-tighter">
                                 {form.startsAt ? new Date(form.startsAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Immediate'}
                               </p>
                            </div>
                            <div className="w-px h-6 bg-slate-100" />
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expiry</p>
                               <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-tighter">
                                 {form.expiresAt ? new Date(form.expiresAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Eternal'}
                               </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/forms/${form.id}/responses`)}
                              className="px-4 py-1.5 bg-brand-50 text-brand-default border border-brand-100/50 rounded-lg text-[11px] font-semibold uppercase tracking-widest hover:bg-brand-default hover:text-white transition-all shadow-sm"
                            >
                              View Responses
                            </button>
                            
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === form.id ? null : form.id);
                                }}
                                className={`p-2 rounded-lg transition-all ${activeMenuId === form.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                              >
                                <MoreVertical size={16} />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === form.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-20" 
                                      onClick={() => setActiveMenuId(null)} 
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-30 py-2"
                                    >
                                      <button
                                        onClick={() => { window.open(`/f/${form.slug}`, '_blank'); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                      >
                                        <Eye size={14} className="text-slate-400" />
                                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Open Form</span>
                                      </button>
                                      <button
                                        onClick={() => { openEditModal(form); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                      >
                                        <Edit size={14} className="text-blue-500" />
                                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Edit Form</span>
                                      </button>
                                      <button
                                        onClick={() => { handleToggleStatus(form.id); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                      >
                                        <Power size={14} className={isLive ? 'text-emerald-500' : 'text-slate-400'} />
                                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{isLive ? 'Deactivate' : 'Activate'}</span>
                                      </button>
                                      <button
                                        onClick={() => { handleCopyLink(form.slug, form.id); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                      >
                                        <Share2 size={14} className="text-amber-500" />
                                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Copy Link</span>
                                      </button>
                                      <div className="h-px bg-slate-50 my-1" />
                                      <button
                                        onClick={() => { handleDeleteForm(form.id); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-rose-50 transition-colors group"
                                      >
                                        <Trash2 size={14} className="text-rose-500" />
                                        <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest">Delete Form</span>
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📟 PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-enterprise shadow-sm">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Showing {forms.length} of {totalElements} entries // Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-brand-default hover:text-brand-default transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-semibold transition-all ${page === i ? 'bg-brand-default text-white shadow-lg shadow-brand-500/20' : 'bg-white border border-slate-200 text-slate-400 hover:border-brand-default hover:text-brand-default'}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-brand-default hover:text-brand-default transition-all disabled:opacity-30 disabled:hover:border-slate-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {forms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-enterprise">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-semibold uppercase tracking-[0.3em] text-xs">Registry Empty // Awaiting Signal</p>
        </div>
      )}

      {/* 🛠️ ASSET RECALIBRATION MODAL (EDIT) */}
      <AnimatePresence>
        {modal.isOpen && modal.type === 'edit' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal({ isOpen: false, type: '', form: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-enterprise shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-default rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-default/20">
                    <History size={20} />
                  </div>
                   <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest leading-none">Recalibrate Asset</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Lifecycle Management Protocol</p>
                  </div>
                </div>
                <button
                  onClick={() => setModal({ isOpen: false, type: '', form: null })}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:text-rose-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                 <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Asset Designation</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
                    placeholder="Enter designation name..."
                  />
                </div>

                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Initialization Date</label>
                    <input
                      type="datetime-local"
                      value={editForm.startsAt}
                      min={minDateTime}
                      onKeyDown={(e) => e.preventDefault()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && new Date(val) < new Date(minDateTime)) return;
                        setEditForm({ ...editForm, startsAt: val });
                        if (editForm.expiresAt && val && new Date(editForm.expiresAt) < new Date(val)) {
                          setEditForm(prev => ({ ...prev, startsAt: val, expiresAt: '' }));
                        }
                      }}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
                    />
                  </div>
                   <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Expiration Date</label>
                    <input
                      type="datetime-local"
                      value={editForm.expiresAt}
                      min={editForm.startsAt || minDateTime}
                      onKeyDown={(e) => e.preventDefault()}
                      onChange={(e) => {
                        const val = e.target.value;
                        const compareDate = editForm.startsAt || minDateTime;
                        if (val && new Date(val) < new Date(compareDate)) return;
                        setEditForm({ ...editForm, expiresAt: e.target.value });
                      }}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                  <p className="text-[10px] font-semibold text-amber-800 leading-normal uppercase">
                    Warning: Modifying lifecycle parameters may disrupt active telemetry streams. Verify sync status before execution.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setModal({ isOpen: false, type: '', form: null })}
                  className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Terminate Request
                </button>
                <button
                  onClick={handleUpdateForm}
                  className="flex-1 h-12 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-brand-default transition-all flex items-center justify-center gap-2 group"
                >
                  <Save size={16} className="group-hover:scale-110 transition-transform" />
                  Commit Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormList;
