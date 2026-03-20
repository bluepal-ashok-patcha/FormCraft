import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ExternalLink,
  Palette
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

import FormPreview from '../components/FormPreview';
import GovernanceModal from '../components/GovernanceModal';

const DEFAULT_THEMES = [
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Green', color: '#10b981' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Slate', color: '#475569' },
];

/* ── Professional Technical Registry Card — Focal Reveal Effect ── */
const FormCard = ({ form, idx, isLive, isOffline, onNavigateResponses, activeMenuId, setActiveMenuId, onOpenForm, onEditForm, onToggleStatus, onCopyLink, onDeleteForm }) => {
  const [hovered, setHovered] = useState(false);

  const statusConfig = isLive
    ? { color: 'bg-emerald-500', text: 'Live', light: 'bg-emerald-50', border: 'border-emerald-100', textCol: 'text-emerald-700' }
    : isOffline
      ? { color: 'bg-red-600', text: 'Offline', light: 'bg-red-50', border: 'border-red-100', textCol: 'text-red-700' }
      : { color: 'bg-amber-500', text: 'Scheduled', light: 'bg-amber-50', border: 'border-amber-100', textCol: 'text-amber-700' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-default/40 h-[480px] flex flex-col overflow-hidden transition-all duration-300"
    >
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header: Identity & Status */}
        <div className={`p-5 flex items-start justify-between border-b border-slate-50 bg-slate-50/30 transition-all duration-500 ${hovered ? 'bg-white' : ''}`}>
          <div className="space-y-1 truncate">
            <h3 className="text-base font-bold text-slate-900 truncate uppercase tracking-tight">
              {form.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 font-mono tracking-wider uppercase">
                ID: {form.slug}
              </span>
              <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${statusConfig.light} ${statusConfig.textCol} border ${statusConfig.border}`}>
                {statusConfig.text}
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === form.id ? null : form.id); }}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
            >
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {activeMenuId === form.id && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 py-2 overflow-hidden"
                  >
                    {[
                      { label: 'Analyze Data', icon: BarChart2, onClick: () => onNavigateResponses(form.id) },
                      { label: 'Edit Form', icon: Edit, onClick: () => onEditForm(form) },
                      { label: 'Preview', icon: Eye, onClick: () => onOpenForm(form.slug) },
                      { label: 'Copy Link', icon: Share2, onClick: () => onCopyLink(form.slug, form.id) },
                      { label: isLive ? 'Take Offline' : 'Go Live', icon: Power, onClick: () => onToggleStatus(form.id), danger: isLive },
                      { label: 'Delete Form', icon: Trash2, onClick: () => onDeleteForm(form), danger: true }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); item.onClick(); setActiveMenuId(null); }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 📟 Focal Viewport: The Miniature Form */}
        <div
          className="relative bg-slate-50 border-b border-slate-100 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ height: hovered ? '320px' : '180px' }}
        >
          <div className={`w-full h-full transition-transform duration-1000 ${hovered ? 'scale-105' : 'scale-100'}`}>
            <FormPreview
              fields={form.schema?.fields || []}
              name={form.name}
              bannerUrl={form.bannerUrl}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
        </div>

        {/* 📊 Data & Interaction Section */}
        <div className={`flex-1 flex flex-col justify-between transition-all duration-500 ${hovered ? 'p-4' : 'p-5'}`}>
          <div className={`transition-all duration-500 ${hovered ? 'opacity-0 -translate-y-4 h-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Captured Yield</p>
                <div className="flex items-center gap-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-none">{form.responseCount || 0}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reports</span>
                </div>
              </div>

              <div className="row-span-2 flex flex-col justify-center space-y-4 border-l border-slate-100 pl-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-brand-default">
                    <Clock size={12} />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Initialization</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 truncate">
                    {form.startsAt ? new Date(form.startsAt).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Immediate Start'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={12} />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Termination</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 truncate">
                    {form.expiresAt ? new Date(form.expiresAt).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Infinite Lifecycle'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logic Blocks</p>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-slate-800 leading-none">{form.schema?.fields?.length || 0}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Elements</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-auto flex items-center justify-between transition-all duration-500 ${hovered ? 'pt-0 border-none' : 'pt-5 border-t border-slate-50'}`}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Record: {new Date(form.createdAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => onNavigateResponses(form.id)}
              className="flex items-center gap-2 text-brand-default hover:text-brand-700 transition-all group/btn"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Open Analytics</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FormList = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();
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
  const [editForm, setEditForm] = useState({ name: '', startsAt: '', expiresAt: '', bannerUrl: '', themeColor: '#6366f1' });
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
      toast.info('Form status updated successfully.');
      fetchForms();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Could not update form status.');
    }
  };

  const handleDeleteForm = (form) => {
    setModal({ isOpen: true, type: 'delete', form });
  };

  const executeDelete = async () => {
    const id = modal.form.id;
    try {
      await api.delete(`/forms/${id}`);
      toast.success('Form deleted successfully.');
      setModal({ isOpen: false, type: '', form: null });
      fetchForms();
    } catch (err) {
      console.error('Deletion failure:', err);
      toast.error('Could not delete form.');
    }
  };

  const openEditModal = (form) => {
    setModal({ isOpen: true, type: 'edit', form });
    setEditForm({
      name: form.name,
      startsAt: form.startsAt ? form.startsAt.split('.')[0] : '',
      expiresAt: form.expiresAt ? form.expiresAt.split('.')[0] : '',
      bannerUrl: form.bannerUrl || '',
      themeColor: form.themeColor || '#6366f1'
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
        expiresAt: editForm.expiresAt || null,
        bannerUrl: editForm.bannerUrl || null,
        themeColor: editForm.themeColor || '#6366f1'
      });
      toast.success('Form details saved successfully.');
      setModal({ isOpen: false, type: '', form: null });
      fetchForms();
    } catch (err) {
      console.error('Update failure:', err);
      toast.error('Could not save form changes.');
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const url = response.url || response.data?.url;
      setEditForm(prev => ({ ...prev, bannerUrl: url }));
      toast.success('Banner image uploaded successfully.');
    } catch (err) {
      toast.error('Could not upload banner image.');
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
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tighter mb-1 leading-none uppercase italic">
                Form Intelligence // <span className="text-brand-500">CONTROL</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-widest opacity-80 mt-1.5">
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
            {/* The following buttons seem to be misplaced from a FormBuilder component's tab navigation */}
            {/* I'm commenting them out as they don't fit the context of FormList's header */}
            {/* <Clock size={14} />
            <span>Schedule</span>
            </button>
            <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'theme' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Palette size={14} />
                <span>Appearance</span>
            </button> */}
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
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
          { label: 'Offline Assets', value: (stats.totalForms || 0) - (stats.activeForms || 0), icon: X, color: 'rose' }
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
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                !sidebarCollapsed 
                  ? 'lg:grid-cols-3' 
                  : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}
            >
              {forms.map((form, idx) => (
                <FormCard
                  key={form.id}
                  form={form}
                  idx={idx}
                  isLive={form.status === 'ACTIVE'}
                  isOffline={form.status === 'INACTIVE'}
                  onNavigateResponses={(id) => navigate(`/forms/${id}/responses`)}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  onOpenForm={(slug) => window.open(`/f/${slug}`, '_blank')}
                  onEditForm={openEditModal}
                  onToggleStatus={handleToggleStatus}
                  onCopyLink={handleCopyLink}
                  onDeleteForm={handleDeleteForm}
                />
              ))}
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
                            isOffline ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            <div className={`w-1 h-1 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : isOffline ? 'bg-red-600' : 'bg-blue-500'}`} />
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
                                        onClick={() => { handleDeleteForm(form); setActiveMenuId(null); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors group"
                                      >
                                        <Trash2 size={14} className="text-red-500" />
                                        <span className="text-[11px] font-semibold text-red-500 uppercase tracking-widest">Delete Form</span>
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

      {/* 🛠️ ASSET RECALIBRATION & PURGE PORTALS */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {/* EDIT MODAL */}
          {modal.isOpen && modal.type === 'edit' && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-[6px] shadow-2xl overflow-hidden border border-slate-100"
              >
                {/* FIXED HEADER */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-default rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-default/20">
                      <Edit size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest leading-none">Edit Form Details</h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Modify your form settings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModal({ isOpen: false, type: '', form: null })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:text-red-600 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Asset Designation</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1 block">Form Banner Image</label>
                    <div className="relative group aspect-[21/9] rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-default transition-all">
                      {editForm.bannerUrl ? (
                        <>
                          <img src={editForm.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-white text-slate-900 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                              <Edit size={16} />
                              <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                            </label>
                            <button
                              onClick={() => setEditForm(prev => ({ ...prev, bannerUrl: '' }))}
                              className="p-2 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <Plus size={24} className="text-slate-300 mb-2" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Upload Banner</span>
                          <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                        </label>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Banner URL (Advanced)</label>
                      <input
                        type="text"
                        value={editForm.bannerUrl}
                        onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
                        placeholder="https://..."
                      />
                    </div>
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

                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1 block">Tactical Theme Color</label>
                    <div className="grid grid-cols-8 gap-2">
                      {DEFAULT_THEMES.map((theme) => (
                        <button
                          key={theme.color}
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, themeColor: theme.color }))}
                          className={`aspect-square rounded-full border-2 transition-all p-0.5 ${editForm.themeColor === theme.color ? 'border-brand-default scale-110' : 'border-transparent hover:scale-105'}`}
                          title={theme.name}
                        >
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: theme.color }} />
                        </button>
                      ))}
                      <div className="relative group">
                        <input 
                          type="color" 
                          value={editForm.themeColor} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, themeColor: e.target.value }))}
                          className="w-full h-full aspect-square rounded-full cursor-pointer bg-slate-50 border border-slate-200 transition-all hover:scale-105 p-0 opacity-0 absolute inset-0 z-10"
                        />
                        <div 
                          className="w-full h-full aspect-square rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-50 transition-all overflow-hidden p-0.5"
                        >
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: editForm.themeColor }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                    <p className="text-[10px] font-semibold text-amber-800 leading-normal uppercase">
                      Warning: Modifying lifecycle parameters may disrupt active telemetry streams. Verify sync status before execution.
                    </p>
                  </div>
                </div>

                {/* FIXED FOOTER */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                  <button
                    onClick={() => setModal({ isOpen: false, type: '', form: null })}
                    className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Terminate Request
                  </button>
                  <button
                    onClick={handleUpdateForm}
                    className="flex-1 h-12 bg-slate-900 text-white rounded-md text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-brand-default transition-all flex items-center justify-center gap-2 group"
                  >
                    <Save size={16} className="group-hover:scale-110 transition-transform" />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>,
        document.body
      )}

      <GovernanceModal 
        isOpen={modal.isOpen && modal.type === 'delete'}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Form Confirmation"
        message={`Are you sure you want to delete "${modal.form?.name}" permanently? All responses and data for this form will be lost.`}
        confirmText="Delete Form"
        type="danger"
      />
    </div>
  );
};

export default FormList;
