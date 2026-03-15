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
  MoreVertical
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
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
    try {
      const respRes = await api.get(`/forms/${id}/responses?page=${page}&size=10`);
      setResponses(respRes.data.content || []);
      setTotalPages(respRes.data.totalPages || 0);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, respRes] = await Promise.all([
          api.get(`/forms/${id}`),
          api.get(`/forms/${id}/responses?page=${page}&size=10`)
        ]);
        // Form controllers return ApiResponse, intercepted to return response.data
        setForm(formRes.data);
        setResponses(respRes.data.content || []);
        setTotalPages(respRes.data.totalPages || 0);
      } catch (err) {
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, page]);

  // Extract keys from response data to use as headers
  // We'll use the first response's keys or fallback to schema fields
  const headers = form?.schema?.fields?.map(f => f.label) || [];

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
              <h1 className="text-xl md:text-xl font-black tracking-tighter mb-1 leading-none uppercase">
                {form?.name} <span className="text-brand-500 text-sm ml-2">// DATA CORE</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-80">
                Inbound Payload Logs <span className="mx-2 text-slate-700">|</span> UUID: {id?.substring(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Filter logs..." 
                className="bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-brand-default w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-5 bg-brand-default text-white h-10 rounded-md font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/10">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      </motion.div>

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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Responses</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{responses.length}</h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 p-6 rounded-enterprise shadow-sm flex items-center gap-5 group hover:border-brand-default/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Form Status</p>
            <h4 className="text-2xl font-black text-emerald-500 tracking-tight uppercase">Live</h4>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Launch Date</p>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
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
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Response Records</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Last Updated at {new Date().toLocaleTimeString()}</p>
             </div>
          </div>
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button className="px-3 py-1.5 text-[9px] font-black text-white bg-slate-900 rounded-md uppercase tracking-widest shadow-sm">Tabular</button>
            <button className="px-3 py-1.5 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Grid View</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Record Profile</th>
                {headers.map(h => (
                  <th key={h} className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Receipt Details</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {responses.map((resp, idx) => (
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
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-default flex items-center justify-center text-[10px] font-black font-mono shadow-sm border border-brand-100/50 group-hover:bg-brand-default group-hover:text-white transition-all">
                          {resp.id.split('-')[0].charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tight">#{resp.id.split('-')[0].toUpperCase()}</span>
                      </div>
                    </td>
                    {headers.map(h => (
                      <td key={h} className="px-8 py-5">
                        <span className="text-sm font-semibold text-slate-700">{resp.responseData[h] || '-'}</span>
                      </td>
                    ))}
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                          {new Date(resp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2 text-slate-300">|</span>
                          {new Date(resp.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                       <button 
                        onClick={() => setActiveMenuId(activeMenuId === resp.id ? null : resp.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                       >
                         <MoreVertical size={16} />
                       </button>
                       
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
                                  setEditData({ ...resp.responseData });
                                  setIsEditing(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest"
                              >
                                <Edit size={12} className="text-blue-500" />
                                Edit Rep
                              </button>
                              <button 
                                onClick={() => {
                                  setDeleteConfirm({ isOpen: true, id: resp.id });
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 uppercase tracking-widest"
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
          
          {responses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-20 grayscale">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList size={40} className="text-white" />
                </div>
                <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-xs">Awaiting Signal...</p>
            </div>
          )}
        </div>

        {/* Pagination Console */}
        {totalPages > 1 && (
          <div className="p-6 px-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index {page + 1} // Level {totalPages}</p>
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
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Response Inspector</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: #{selectedResponse.id.split('-')[0].toUpperCase()}</p>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-medium focus:outline-none focus:border-brand-default transition-all"
                        value={editData[field.label] || ''}
                        onChange={(e) => setEditData({ ...editData, [field.label]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-[4px]">
                        <p className="text-sm font-semibold text-slate-700">
                          {selectedResponse.responseData[field.label] || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!isEditing && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received: {new Date(selectedResponse.submittedAt).toLocaleString()}</span>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
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
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest mr-auto"
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
                            className="btn-secondary h-9 px-4 text-[11px] font-bold flex items-center gap-2 rounded-[4px] bg-white border-slate-200 hover:border-brand-default"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                             onClick={() => setDeleteConfirm({ isOpen: true, id: selectedResponse.id })}
                             className="btn-danger h-9 px-4 text-[11px] font-bold flex items-center gap-2 rounded-[4px] bg-white border-rose-200 text-rose-500 hover:bg-rose-50"
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
                             refreshData();
                           } catch (err) {
                             alert('Failed to update response: ' + (err.message || 'Unknown error'));
                           }
                        }}
                        className="btn-primary h-9 px-4 text-[11px] font-bold flex items-center gap-2 rounded-[4px]"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary h-9 px-4 text-[11px] font-bold rounded-[4px] bg-white"
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
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Erase Submission?</h3>
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
                      refreshData();
                    } catch (err) {
                      alert('Broadcast failure: Unable to delete record');
                    }
                  }}
                  className="flex-1 h-10 bg-rose-500 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Confirm Erase
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                  className="flex-1 h-10 bg-slate-50 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormResponses;
