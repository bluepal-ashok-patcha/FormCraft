import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  History,
  Zap,
  Trash2,
  ChevronRight,
  Clock,
  Layers,
  ArrowUpRight,
  GripHorizontal,
  GripVertical
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import FormPreview from './FormPreview';
import GovernanceModal from './GovernanceModal';

const DraftGallery = ({ isOpen, onClose, onSelect, onDeployFields, onDraftDragStart, onDraftDragEnd }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deploying, setDeploying] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    if (isOpen) fetchDrafts();
  }, [isOpen]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/forms/drafts');
      if (res.success) {
        setDrafts(res.data || []);
      }
    } catch {
      toast.error('Strategic Interruption: Could not load architectural drafts.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter((d) =>
    (d.name || 'Untitled Prototype').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = (draft) => {
    setDeploying(draft.id);
    onSelect({
      id: draft.id,
      name: draft.name,
      schema: draft.schema,
      startsAt: draft.startsAt,
      expiresAt: draft.expiresAt,
      bannerUrl: draft.bannerUrl,
      themeColor: draft.themeColor,
      isDraft: true
    });
    setTimeout(() => {
      setDeploying(null);
      onClose();
    }, 500);
  };

  const handleDeleteDraft = async (e, draft) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: "Purge Architectural Session",
      message: `Are you sure you want to permanently delete the draft "${draft.name || 'Untitled'}"? This action is irreversible.`,
      confirmText: "Purge Draft",
      type: "danger",
      onConfirm: async () => {
        try {
          // Purge specifically by the unique session ID (draft.id)
          await api.delete(`/forms/draft?draftId=${draft.id}`);
          toast.success('Draft deleted successfully.');
          fetchDrafts();
        } catch {
          toast.error('Purge Failed: Error de-indexing architectural session.');
        }
      }
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="draft-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-white shadow-2xl border-r border-slate-200"
          >
            {/* Panel Header */}
            <div className="px-4 pt-5 pb-4 border-b border-indigo-100 bg-indigo-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <History size={15} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest leading-none">
                      Active Sessions
                    </h3>
                    <p className="text-[9px] font-semibold text-indigo-400 mt-0.5 uppercase tracking-widest">
                      {filteredDrafts.length} prototypes recovered
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 shrink-0 bg-white border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Drafts List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Scanning Registry...</p>
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                    <Zap size={24} className="text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                    <p className="text-[8px] font-medium text-slate-300 max-w-[140px] leading-relaxed">System is clear. New architectural sessions will appear here.</p>
                  </div>
                </div>
              ) : (
                filteredDrafts.map((draft, idx) => {
                   const buildPayload = () => {
                    const fields = (draft.schema?.fields || []).map((f) => ({
                      ...f,
                      id: Math.random().toString(36).substr(2, 9)
                    }));
                    return JSON.stringify({ name: draft.name, bannerUrl: draft.bannerUrl || '', fields });
                  };

                  return (
                    <motion.div
                      key={draft.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('templateDrop', buildPayload());
                        e.dataTransfer.effectAllowed = 'copy';
                        onDraftDragStart?.();
                      }}
                      onDragEnd={() => onDraftDragEnd?.()}
                      className="group bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 cursor-grab active:cursor-grabbing"
                    >
                      <div className="relative h-20 overflow-hidden bg-slate-50 group-active:scale-95 transition-transform">
                        {draft.bannerUrl ? (
                          <img src={draft.bannerUrl} alt="" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        ) : (
                          <div className="w-full h-full p-4 scale-75 origin-top opacity-40 grayscale pointer-events-none">
                             <FormPreview fields={draft.schema?.fields || []} name={draft.name} />
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <button 
                            onClick={(e) => handleDeleteDraft(e, draft)}
                            className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm hover:scale-110 transition-all border border-slate-100"
                           >
                             <Trash2 size={12} />
                           </button>
                        </div>

                        <div className="absolute top-2 left-2">
                           <div className="px-1.5 py-0.5 bg-indigo-600 text-white text-[7px] font-bold uppercase rounded-md shadow-lg shadow-indigo-500/20">
                             Draft Node
                           </div>
                        </div>

                        <div className="absolute bottom-2 right-2">
                           <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical size={8} className="text-indigo-400" />
                              <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">Clone</span>
                           </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                              {draft.name || 'Untitled Session'}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                              <Clock size={8} />
                              {new Date(draft.updatedAt).toLocaleDateString()} // {new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                             <span className="text-[8px] font-black text-indigo-600/40">{draft.schema?.fields?.length || 0} ELMS</span>
                          </div>
                        </div>

                        <motion.button
                          onClick={() => handleRestore(draft)}
                          disabled={deploying === draft.id}
                          whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border border-slate-100 hover:border-indigo-600"
                        >
                          {deploying === draft.id ? 'Recovering...' : 'Restore Segment'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-50 bg-slate-50/50 shrink-0">
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] text-center">
                Strategic Session Recovery Hub
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GovernanceModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </>
  );
};

export default DraftGallery;
