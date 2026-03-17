import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Filter,
  Layers,
  Zap,
  Settings2,
  Plus,
  Layout
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import CategoryManager from '../components/CategoryManager';
import FormPreview from '../components/FormPreview';

const TemplateHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', label: 'All' });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN' || r.name === 'ROLE_SUPER_ADMIN');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [templatesRes, categoriesRes] = await Promise.all([
        api.get('/templates'),
        api.get('/templates/categories')
      ]);
      setTemplates(templatesRes.data || []);
      setCategories([{ id: 'all', label: 'All', name: 'ALL' }, ...(categoriesRes.data || [])]);
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

  const handleDeploy = (template) => {
    // Navigate to builder with template data
    navigate('/builder', { state: { template } });
    toast.success('Architecture Selected: System primed for deployment.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-enterprise py-5 px-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-default/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-default rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight leading-none italic">Asset Hub</h1>
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <Layout size={12} className="text-brand-default" />
                Global Blueprint Registry // Enterprise v4.0
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={() => setShowCategoryManager(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-brand-default border border-white/10 transition-all flex items-center gap-2 group"
              >
                <Settings2 size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                Manage Taxonomy
              </button>
            )}
            <button 
                onClick={() => navigate('/builder')}
                className="px-6 py-3 bg-brand-default hover:bg-brand-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Scratch Build
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Controls */}
      <div className="bg-white rounded-enterprise border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Query blueprint registry..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-default transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory.id === cat.id 
                  ? 'bg-brand-default text-white shadow-lg shadow-brand-500/20' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-brand-default'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-default/20 border-t-brand-default rounded-full animate-spin" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Synchronizing Global Asset Stream...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Filter size={48} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 uppercase italic">Zero Matches Found</h3>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Adjust your filters or query to explore other assets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:border-brand-default/30 transition-all flex flex-col cursor-pointer overflow-hidden relative"
                onClick={() => handleDeploy(template)}
              >
                {/* 🎨 PREMIUM VISUAL HEADER */}
                <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden bg-slate-100 border-b border-slate-100 group-hover:border-brand-default/20 transition-all duration-500">
                  {template.thumbnailUrl ? (
                    <img 
                      src={template.thumbnailUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                      <FormPreview fields={template.schema.fields} name={template.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
                    </div>
                  )}
                  
                  {/* Floating Identity & Status */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                    <div className="flex flex-col gap-2">
                      {template.category && (
                        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-semibold uppercase tracking-widest rounded-lg shadow-xl">
                          {template.category.label}
                        </span>
                      )}
                    </div>
                    {template.global && (
                      <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-semibold uppercase rounded-lg border border-emerald-100 flex items-center gap-2 shadow-sm"
                      >
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Certified Asset
                      </motion.div>
                    )}
                  </div>

                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="relative z-10">
                    <h4 className="text-lg font-semibold text-slate-900 uppercase tracking-tight mb-2 group-hover:text-brand-default transition-colors">{template.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1 line-clamp-2">
                    {template.description || "Initialize this high-fidelity architecture into your build session for instant data harvesting deployment."}
                    </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Zap size={12} className="text-amber-500" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">{template.schema.fields.length} Components</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-default opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Invoke Deployment</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CategoryManager 
        isOpen={showCategoryManager}
        onClose={() => {
          setShowCategoryManager(false);
          fetchInitialData(); 
        }}
      />
    </div>
  );
};

export default TemplateHub;
