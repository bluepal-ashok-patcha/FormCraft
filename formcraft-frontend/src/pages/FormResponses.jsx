import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Calendar,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  Activity,
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ClipboardList,
  MoreVertical,
  History,
  Paperclip,
  Eye
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      let url = `/forms/${id}/responses?page=${page}&size=10`;
      if (dateRange.start) url += `&startDate=${new Date(dateRange.start).toISOString()}`;
      if (dateRange.end) url += `&endDate=${new Date(dateRange.end).toISOString()}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      const respRes = await api.get(url);
      setResponses(respRes.data.content || []);
      setTotalPages(respRes.data.totalPages || 0);
      setTotalElements(respRes.data.totalElements || 0);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (loading) setLoading(true);
      else setRefreshing(true);
      try {
        let url = `/forms/${id}/responses?page=${page}&size=10`;
        if (dateRange.start) url += `&startDate=${new Date(dateRange.start).toISOString()}`;
        if (dateRange.end) url += `&endDate=${new Date(dateRange.end).toISOString()}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const [formRes, respRes] = await Promise.all([
          api.get(`/forms/${id}`),
          api.get(url)
        ]);
        // Form controllers return ApiResponse, intercepted to return response.data
        setForm(formRes.data);
        setResponses(respRes.data.content || []);
        setTotalPages(respRes.data.totalPages || 0);
        setTotalElements(respRes.data.totalElements || 0);
      } catch (err) {
        console.error('Error fetching responses:', err);
        toast.error('Sync Error: Could not retrieve latest payload history.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchData();
  }, [id, page, dateRange, searchTerm]);
  
  const handleExportCsv = async () => {
    try {
      const params = {};
      if (dateRange.start) params.startDate = new Date(dateRange.start).toISOString();
      if (dateRange.end) params.endDate = new Date(dateRange.end).toISOString();
      if (searchTerm) params.search = searchTerm;

      const data = await api.get(`/forms/${id}/responses/export`, {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `responses_${form?.name || id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Strategy Exported: Your filtered responses have been successfully downloaded.');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export Error: Could not synchronize CSV download.');
    }
  };

  // Server-side search results
  const filteredResponses = responses;

  // Extract mapping from schema fields
  const fieldMapping = form?.schema?.fields || [];
  const headers = fieldMapping.map(f => ({ id: f.id, label: f.label }));

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-default"></div>
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
          <div className="flex items-center gap-5 flex-1">
            <button 
              onClick={() => navigate('/forms')}
              className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-default transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-xl font-semibold tracking-tighter mb-1 leading-none uppercase">
                {form?.name} <span className="text-brand-500 text-sm ml-2">// DATA CORE</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest opacity-80">
                Inbound Payload Logs <span className="mx-2 text-slate-700">|</span> UUID: {id?.substring(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button 
              onClick={handleExportCsv}
              className="px-5 bg-brand-default text-white h-10 rounded-md font-semibold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10"
            >
              <FileSpreadsheet size={14} />
              Export CSV
            </button>
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all ml-1"
              title="Refresh Data"
            >
              <History size={18} className={refreshing ? 'animate-spin text-brand-default' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🔍 LOG FILTERS & SEARCH */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 p-4 rounded-enterprise shadow-sm flex flex-wrap items-center gap-4"
      >
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search within loaded payloads..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => {
                const newStart = e.target.value;
                const newEnd = (dateRange.end && newStart > dateRange.end) ? '' : dateRange.end;
                setDateRange({...dateRange, start: newStart, end: newEnd});
                setPage(0);
              }}
              className="bg-transparent border-none py-2 text-[10px] font-semibold text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300 mx-1">-</span>
            <input 
              type="date" 
              value={dateRange.end}
              min={dateRange.start}
              onChange={(e) => { setDateRange({...dateRange, end: e.target.value}); setPage(0); }}
              className="bg-transparent border-none py-2 text-[10px] font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        <button 
          onClick={clearFilters}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Reset Sequence"
        >
          <X size={18} />
        </button>
      </motion.div>

      <div className={`space-y-8 transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
        {/* 📊 ANALYTIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 p-6 rounded-enterprise shadow-sm flex items-center gap-5 group hover:border-brand-default/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Responses</p>
              <h4 className="text-2xl font-semibold text-slate-900 tracking-tight">{totalElements}</h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-100 p-6 rounded-enterprise shadow-sm flex items-center gap-5 group hover:border-brand-default/30 transition-all col-span-1"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <History size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Life Cycle Schedule</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter">Initiation</p>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {form?.startsAt ? new Date(form.startsAt).toLocaleDateString() : 'IMMEDIATE'}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter">Decommission</p>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {form?.expiresAt ? new Date(form.expiresAt).toLocaleDateString() : 'ETERNAL'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-100 p-6 rounded-enterprise shadow-sm flex items-center gap-5 group hover:border-brand-default/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Launch Date</p>
              <h4 className="text-xl font-semibold text-slate-900 tracking-tight">
                {form?.createdAt ? new Date(form.createdAt).toLocaleDateString() : '-'}
              </h4>
            </div>
          </motion.div>
        </div>

        {/* 🕹️ RESPONSE LOGS TABLE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-enterprise border border-slate-100 shadow-xl overflow-hidden"
        >
          <div className="bg-white p-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <TableIcon size={16} />
               </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest">Response Records</h3>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1 tracking-widest">Last Updated at {new Date().toLocaleTimeString()}</p>
                </div>
             </div>
             <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
               <div className="px-4 py-1.5 text-[9px] font-semibold text-white bg-slate-900 rounded-md uppercase tracking-widest shadow-sm flex items-center gap-2">
                 <TableIcon size={12} />
                 Tabular Registry
               </div>
             </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Record Profile</th>
                {headers.map(h => (
                  <th key={h.id} className="px-8 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{h.label}</th>
                ))}
                <th className="px-8 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">Receipt Details</th>
                <th className="px-8 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredResponses.map((resp, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    key={resp.id} 
                    onClick={() => setSelectedResponse(resp)}
                    className="hover:bg-brand-50/30 transition-all group cursor-pointer active:scale-[0.99]"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-default flex items-center justify-center text-[10px] font-semibold font-mono shadow-sm border border-brand-100/50 group-hover:bg-brand-default group-hover:text-white transition-all">
                          {resp.id.split('-')[0].charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-tight">#{resp.id.split('-')[0].toUpperCase()}</span>
                      </div>
                    </td>
                    {headers.map(h => {
                      const value = resp.responseData[h.id] !== undefined ? resp.responseData[h.id] : resp.responseData[h.label];
                      return (
                        <td key={h.id} className="px-8 py-5">
                          <span className="text-sm font-semibold text-slate-700">
                            {Array.isArray(value) 
                              ? value.join(', ') 
                              : (typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary')
                                  ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-brand-default hover:underline flex items-center gap-1"><Paperclip size={12} /> View Asset</a>
                                  : (value || '-'))}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-tight">
                          {new Date(resp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2 text-slate-300">|</span>
                          {new Date(resp.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-center gap-1">
                         <button 
                          onClick={() => {
                            setSelectedResponse(resp);
                            setIsEditing(false);
                          }}
                          className="p-2 hover:bg-brand-50 rounded-lg text-brand-default transition-all"
                          title="View Payload Data"
                         >
                           <Eye size={16} />
                         </button>
                         <button 
                          onClick={() => setActiveMenuId(activeMenuId === resp.id ? null : resp.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                         >
                           <MoreVertical size={16} />
                         </button>
                       </div>
                       
                       <AnimatePresence>
                         {activeMenuId === resp.id && (
                           <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-36 bg-white border border-slate-100 shadow-xl rounded-[6px] py-1 z-20 overflow-hidden"
                           >
                               <button 
                                onClick={() => {
                                  setSelectedResponse(resp);
                                  setIsEditing(false);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"
                              >
                                <Eye size={12} className="text-brand-500" />
                                View Data
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedResponse(resp);
                                  setEditData({ ...resp.responseData });
                                  setIsEditing(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"
                              >
                                <Edit size={12} className="text-blue-500" />
                                Edit Rep
                              </button>
                              <button 
                                onClick={() => {
                                  setDeleteConfirm({ isOpen: true, id: resp.id });
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-[11px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 uppercase tracking-widest"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredResponses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-20 grayscale">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList size={40} className="text-white" />
                </div>
                <p className="text-slate-900 font-semibold uppercase tracking-[0.3em] text-xs">Awaiting Signal...</p>
            </div>
          )}
        </div>

        {/* Pagination Console */}
        {totalPages > 1 && (
          <div className="p-6 px-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Index {page + 1} // Level {totalPages}</p>
            <div className="flex gap-3">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 border border-slate-200 rounded-xl bg-white text-slate-400 disabled:opacity-30 hover:border-brand-default hover:text-brand-default transition-all shadow-sm flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 border border-slate-200 rounded-xl bg-white text-slate-400 disabled:opacity-30 hover:border-brand-default hover:text-brand-default transition-all shadow-sm flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* 🔍 DETAIL MODAL */}
      <AnimatePresence>
        {selectedResponse && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isEditing) setSelectedResponse(null);
              }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-[6px] shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-50 text-brand-default flex items-center justify-center">
                    <TableIcon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-default tracking-widest uppercase">
                       {isEditing ? 'Data Correction' : 'Response Inspector'}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">ID: #{selectedResponse.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedResponse(null);
                    setIsEditing(false);
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-5">
                {form?.schema?.fields?.map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-medium focus:outline-none focus:border-brand-default transition-all"
                        value={editData[field.id] !== undefined ? editData[field.id] : editData[field.label] || ''}
                        onChange={(e) => setEditData({ ...editData, [field.id]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-[4px]">
                        {(() => {
                           const value = selectedResponse.responseData[field.id] !== undefined ? selectedResponse.responseData[field.id] : selectedResponse.responseData[field.label];
                           return typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary') ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-brand-50 text-brand-default rounded flex items-center justify-center">
                                  <Paperclip size={14} />
                                </div>
                                <span className="text-sm font-semibold text-brand-default">External Attachment</span>
                              </div>
                              <a 
                                href={value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 hover:text-brand-default hover:border-brand-default transition-all shadow-sm"
                              >
                                Open Protocol
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-slate-700">
                              {Array.isArray(value) 
                                ? value.join(', ') 
                                : (value || '-')}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}

                {!isEditing && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Received: {new Date(selectedResponse.submittedAt).toLocaleString()}</span>
                     </div>
                     <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        Verified
                     </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    setSelectedResponse(null);
                    setIsEditing(false);
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-widest mr-auto"
                >
                  Dismiss
                </button>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => {
                              setEditData({ ...selectedResponse.responseData });
                              setIsEditing(true);
                            }}
                            className="btn-secondary h-9 px-4 text-[11px] font-semibold flex items-center gap-2 rounded-[4px] bg-white border-slate-200 hover:border-brand-default"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                             onClick={() => setDeleteConfirm({ isOpen: true, id: selectedResponse.id })}
                             className="btn-danger h-9 px-4 text-[11px] font-semibold flex items-center gap-2 rounded-[4px] bg-white border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={async () => {
                           try {
                             const res = await api.put(`/responses/${selectedResponse.id}`, editData);
                             setSelectedResponse(res.data);
                             setIsEditing(false);
                             toast.success('Packet Modified: Response data updated successfully.');
                             refreshData();
                           } catch (err) {
                             toast.error('Update Failed: ' + (err.response?.data?.message || err.message));
                           }
                        }}
                        className="btn-primary h-9 px-4 text-[11px] font-semibold flex items-center gap-2 rounded-[4px]"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary h-9 px-4 text-[11px] font-semibold rounded-[4px] bg-white"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[6px] shadow-2xl p-6 border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 uppercase tracking-tight">Erase Submission?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                You are about to permanently remove this payload from the database. This action is irreversible.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={async () => {
                    try {
                      await api.delete(`/responses/${deleteConfirm.id}`);
                      setDeleteConfirm({ isOpen: false, id: null });
                      setSelectedResponse(null);
                      toast.success('Data Erased: Response permanently removed from logs.');
                      refreshData();
                    } catch (err) {
                      toast.error('Erase Failed: Broadcast failure - unable to delete record.');
                    }
                  }}
                  className="flex-1 h-10 bg-red-600 text-white rounded-[4px] text-[11px] font-semibold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                >
                  Confirm Erase
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                  className="flex-1 h-10 bg-slate-50 text-slate-500 rounded-[4px] text-[11px] font-semibold uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default FormResponses;
