import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Layout, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Filter,
  Layers,
  Zap,
  Settings2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import CategoryManager from './CategoryManager';
import FormPreview from './FormPreview';

const TemplateGallery = ({ isOpen, onClose, onSelect }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', label: 'All' });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN' || r.name === 'ROLE_SUPER_ADMIN');

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [templatesRes, categoriesRes] = await Promise.all([
        api.get('/templates'),
        api.get('/templates/categories')
      ]);
      setTemplates(templatesRes.data);
      setCategories([{ id: 'all', label: 'All', name: 'ALL' }, ...categoriesRes.data]);
    } catch (err) {
      toast.error('Strategic Failure: Could not synchronize with the Asset Library.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory.id === 'all' || t.category?.id === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
              <Sparkles className="text-brand-default" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none">Global Asset Library</h2>
              <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-[0.2em] mt-2 opacity-80">Deployment Registry & Lifecycle Monitor // v4.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => setShowCategoryManager(true)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-brand-default border border-slate-100 transition-all flex items-center gap-2 group"
                title="Manage Industry Sectors"
              >
                <Settings2 size={18} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-semibold uppercase tracking-widest hidden sm:inline">Taxonomy Manager</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search blueprint registry..." 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory.id === cat.id 
                    ? 'bg-brand-default text-white shadow-md' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-brand-default'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
              <div className="w-12 h-12 border-4 border-brand-default/20 border-t-brand-default rounded-full animate-spin" />
              <p className="text-[10px] font-semibold uppercase tracking-widest">Synchronizing Protocols...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Filter size={32} className="text-slate-300" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest">No matching blueprints found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:border-brand-default/30 transition-all flex flex-col cursor-pointer"
                  onClick={() => onSelect(template)}
                >
                  {/* 🎨 VISUAL ANCHOR */}
                  <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-50 border-b border-slate-100 group-hover:border-brand-default/20 transition-all duration-500">
                    {template.thumbnailUrl ? (
                      <img 
                        src={template.thumbnailUrl} 
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700 bg-white">
                        <FormPreview fields={template.schema.fields} name={template.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                       {template.global && (
                         <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-bold uppercase rounded-md border border-emerald-100 shadow-sm">Certified</span>
                       )}
                       {template.category && (
                         <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[7px] font-bold uppercase rounded-md">{template.category.label}</span>
                       )}
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-2 group-hover:text-brand-default transition-colors">{template.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed flex-1">
                    {template.description || "Deploy this standardized architecture for rapid data collection and secure processing."}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className="text-amber-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{template.schema.fields.length} Fields</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-brand-default opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest">Deploy</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="text-center">
                 <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Availability</p>
                 <p className="text-xs font-bold text-slate-700">Global Registry</p>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="text-center">
                 <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">Ready Assets</p>
                 <p className="text-xs font-bold text-slate-700">{templates.length}</p>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="px-6 py-2.5 rounded-xl text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
           >
             Continue with Scratch Build
           </button>
        </div>
      </motion.div>

      <CategoryManager 
        isOpen={showCategoryManager}
        onClose={() => {
          setShowCategoryManager(false);
          fetchInitialData(); // Refresh categories when manager closes
        }}
      />
    </div>
  );
};

export default TemplateGallery;
