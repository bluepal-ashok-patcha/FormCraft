import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Sparkles,
  Zap,
  Settings2,
  ChevronRight,
  Filter,
  Layers,
  CheckCircle2,
  GripVertical,
  Pencil,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import CategoryManager from './CategoryManager';
import FormPreview from './FormPreview';
import GovernanceModal from './GovernanceModal';

const TemplateGallery = ({ isOpen, onClose, onSelect, onDeployFields, onTemplateDragStart, onTemplateDragEnd }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', label: 'All' });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [deploying, setDeploying] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');

  const canManageTemplate = (template) => {
    if (isSuperAdmin) return true;
    const creator = template.createdBy?.toLowerCase();
    const isOwner = creator === user?.username?.toLowerCase() || creator === user?.email?.toLowerCase();
    return isOwner && !template.global;
  };

  useEffect(() => {
    if (isOpen) fetchInitialData();
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [templatesRes, categoriesRes] = await Promise.all([
        api.get('/templates'),
        api.get('/templates/categories'),
      ]);
      setTemplates(templatesRes.data);
      setCategories([{ id: 'all', label: 'All' }, ...categoriesRes.data]);
    } catch {
      toast.error('Could not load templates.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory.id === 'all' || t.category?.id === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = (template) => {
    setDeploying(template.id);
    const normalizedFields = (template.schema?.fields || []).map((f) => ({
      ...f,
      id: Math.random().toString(36).substr(2, 9),
      ...(['dropdown', 'radio', 'checkbox'].includes(f.type) && !f.options
        ? { options: ['Option 1', 'Option 2'] }
        : {}),
    }));
    onDeployFields({
      fields: normalizedFields,
      name: template.name,
      bannerUrl: template.thumbnailUrl || '',
    });
    setTimeout(() => {
      setDeploying(null);
      onClose();
    }, 500);
  };

  const handleDeleteTemplate = async (e, templateId) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: "Delete Template Confirmation",
      message: "Are you sure you want to delete this template permanently? This action cannot be reversed.",
      confirmText: "Delete Template",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/templates/${templateId}`);
          toast.success('Template removed successfully.');
          fetchInitialData();
        } catch {
          toast.error('Could not delete template.');
        }
      }
    });
  };

  const handleEdit = (template) => {
    onSelect(template, true);
    toast.info('Editor Primed: You can now modify the template.');
  };

  const handleDecertify = async (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: "Remove Global Status",
      message: "Are you sure you want to remove this template from the global list? It will be returned to private template status.",
      confirmText: "Remove From Global",
      type: "warning",
      onConfirm: async () => {
        try {
          await api.post(`/templates/${id}/decertify`);
          toast.success('Template updated: Global status removed.');
          fetchInitialData();
        } catch {
          toast.error('Could not update template status.');
        }
      }
    });
  };

  const handleRejectPromotion = async (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: "Reject Promotion Request",
      message: "Reject this request to make the template global? This will cancel the pending promotion.",
      confirmText: "Reject Request",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.post(`/templates/${id}/reject`);
          toast.success('Promotion rejected successfully.');
          fetchInitialData();
        } catch {
          toast.error('Could not process rejection.');
        }
      }
    });
  };

  const handleCancelRequest = async (e, id) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      title: "Cancel Global Request",
      message: "Withdraw your request to make this template global?",
      confirmText: "Cancel Request",
      type: "warning",
      onConfirm: async () => {
        try {
          await api.post(`/templates/${id}/cancel-request`);
          toast.success('Promotion request canceled successfully.');
          fetchInitialData();
        } catch {
          toast.error('Could not cancel request.');
        }
      }
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="template-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-white"
          >
            {/* Panel Header */}
            <div className="px-4 pt-5 pb-4 border-b border-brand-100 bg-brand-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center">
                    <Sparkles size={15} className="text-brand-default" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest leading-none">
                      Blueprint Library
                    </h3>
                    <p className="text-[9px] font-semibold text-brand-400 mt-0.5 uppercase tracking-widest">
                      {filteredTemplates.length} templates ready
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <button
                      onClick={() => setShowCategoryManager(true)}
                      className="p-1.5 rounded-lg text-brand-300 hover:text-brand-default hover:bg-brand-100 transition-all"
                      title="Manage Categories"
                    >
                      <Settings2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-brand-300 hover:text-brand-default hover:bg-brand-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 shrink-0 bg-white border-b border-brand-50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full bg-brand-50 border border-brand-100 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-brand-900 placeholder:text-brand-300 outline-none focus:bg-white focus:border-brand-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="px-4 py-3 shrink-0 border-b border-brand-50">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedCategory.id === cat.id
                        ? 'bg-brand-default text-white shadow-sm shadow-brand-200'
                        : 'bg-brand-50 text-brand-400 hover:bg-brand-100 hover:text-brand-default border border-brand-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-default rounded-full animate-spin" />
                  <p className="text-[9px] font-bold text-brand-300 uppercase tracking-widest">
                    Loading...
                  </p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
                    <Filter size={20} className="text-brand-200" />
                  </div>
                  <p className="text-[9px] font-bold text-brand-300 uppercase tracking-widest">
                    No templates found
                  </p>
                </div>
              ) : (
                filteredTemplates.map((template, idx) => {
                  const buildPayload = () => {
                    const fields = (template.schema?.fields || []).map((f) => ({
                      ...f,
                      id: Math.random().toString(36).substr(2, 9),
                      ...(['dropdown', 'radio', 'checkbox'].includes(f.type) && !f.options
                        ? { options: ['Option 1', 'Option 2'] } : {}),
                    }));
                    return JSON.stringify({ name: template.name, bannerUrl: template.thumbnailUrl || '', fields });
                  };

                  return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('templateDrop', buildPayload());
                      e.dataTransfer.effectAllowed = 'copy';
                      onTemplateDragStart?.();
                    }}
                    onDragEnd={() => onTemplateDragEnd?.()}
                    className="group bg-white border border-brand-100 hover:border-brand-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-brand-100 cursor-grab active:cursor-grabbing"
                  >
                    {/* Mini preview thumbnail */}
                    <div className="relative h-24 overflow-hidden bg-brand-50">
                      {template.thumbnailUrl ? (
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full scale-[0.85] origin-top">
                          <FormPreview
                            fields={template.schema?.fields || []}
                            name={template.name}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-500/5 group-hover:opacity-0 transition-opacity" />

                    {/* Drag handle + Badges overlay */}
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-brand-100 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                        <GripVertical size={9} className="text-brand-300" />
                        <span className="text-[8px] font-bold text-brand-400 uppercase tracking-wide">Drag</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {template.global && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[7px] font-bold uppercase rounded-md border border-emerald-200 w-fit">
                            Certified
                          </span>
                        )}
                        {template.requestedForGlobal && !template.global && (
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[7px] font-bold uppercase rounded-md shadow-sm">
                              Pending Review
                            </span>
                            {((template.createdBy?.toLowerCase() === user?.username?.toLowerCase()) || 
                              (template.createdBy?.toLowerCase() === user?.email?.toLowerCase())) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCancelRequest(e, template.id); }}
                                className="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-bold uppercase rounded-md shadow-sm hover:bg-red-700 transition-all border border-red-700"
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        )}
                        {template.category && (
                          <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[7px] font-bold uppercase rounded-md w-fit">
                            {template.category.label}
                          </span>
                        )}
                      </div>

                      {/* Field count */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-brand-100">
                        <Zap size={8} className="text-amber-500" />
                        <span className="text-[8px] font-bold text-brand-600">
                          {template.schema?.fields?.length || 0} fields
                        </span>
                      </div>

                      {/* Management Controls Overlay */}
                      {canManageTemplate(template) && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 pointer-events-auto z-10 transition-transform duration-300">
                          {isSuperAdmin && template.global && (
                            <button 
                              onClick={(e) => handleDecertify(e, template.id)}
                              className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 hover:text-white hover:bg-orange-500 shadow-sm transition-all"
                              title="Decertify Blueprint"
                            >
                              <ShieldCheck size={11} />
                            </button>
                          )}
                          {isSuperAdmin && template.requestedForGlobal && !template.global && (
                            <button 
                              onClick={(e) => handleRejectPromotion(e, template.id)}
                              className="w-7 h-7 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 shadow-sm transition-all"
                              title="Reject Promotion"
                            >
                              <X size={11} />
                            </button>
                          )}
                          {!isSuperAdmin && template.requestedForGlobal && !template.global && template.createdBy === user?.username && (
                            <button 
                              onClick={(e) => handleCancelRequest(e, template.id)}
                              className="w-7 h-7 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 shadow-sm transition-all shadow-red-500/10"
                              title="Cancel Promotion Request"
                            >
                              <X size={11} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                            className="w-7 h-7 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-400 hover:text-brand-default hover:bg-brand-50 shadow-sm transition-all"
                            title="Edit Architectural Blueprint"
                          >
                            <Pencil size={11} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteTemplate(e, template.id)}
                            className="w-7 h-7 rounded-xl bg-white border border-brand-100 flex items-center justify-center text-brand-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
                            title="Strategic Purge Asset"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h4 className="text-[11px] font-bold text-brand-900 uppercase tracking-tight mb-1 leading-tight group-hover:text-brand-default transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-[9px] text-brand-400 font-medium leading-relaxed line-clamp-2 mb-3">
                        {template.description || 'A ready-to-use template for rapid deployment.'}
                      </p>

                      <motion.button
                        onClick={() => handleDeploy(template)}
                        disabled={deploying === template.id}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-50 hover:bg-brand-default text-brand-default hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border border-brand-200 hover:border-brand-default hover:shadow-md hover:shadow-brand-200 disabled:opacity-60"
                      >
                        {deploying === template.id ? (
                          <>
                            <CheckCircle2 size={12} className="animate-bounce" />
                            <span>Deploying...</span>
                          </>
                        ) : (
                          <>
                            <Layers size={12} />
                            <span>Use Template</span>
                            <ChevronRight size={11} className="opacity-50" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-brand-100 bg-brand-50 shrink-0">
              <p className="text-[9px] font-semibold text-brand-300 uppercase tracking-widest text-center">
                Click a template to cascade fields into the builder
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => {
          setShowCategoryManager(false);
          fetchInitialData();
        }}
      />

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

export default TemplateGallery;
