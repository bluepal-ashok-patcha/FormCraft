import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Filter,
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

/* ── Per-card component with hover-reveal parallax ── */
const TemplateCard = ({ template, user, onDeploy, onPromote, onRequestPromotion }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-default/30 cursor-pointer overflow-hidden relative flex flex-col"
      style={{ height: '380px', transition: 'box-shadow 0.3s, border-color 0.3s' }}
      onClick={() => onDeploy(template)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Preview panel — grows from ~36% to 100% on hover ── */}
      <div
        style={{
          height: hovered ? '100%' : '36%',
          transition: 'height 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <FormPreview
          fields={template.schema?.fields || []}
          name={template.name}
          thumbnailUrl={template.thumbnailUrl}
        />

        {/* Badges — always visible on top */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 pointer-events-none">
          <div>
            {template.category && (
              <span className="pointer-events-auto px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-semibold uppercase tracking-widest rounded-lg shadow-xl">
                {template.category.label}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {template.global ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-semibold uppercase rounded-lg border border-emerald-100 flex items-center gap-2 shadow-sm"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Certified Asset
              </motion.div>
            ) : user?.roles?.includes('ROLE_SUPER_ADMIN') ? (
              template.requestedForGlobal ? (
                <button
                  className="pointer-events-auto px-3 py-1 bg-brand-default text-white text-[8px] font-semibold uppercase rounded-lg shadow-lg hover:bg-brand-600 transition-all flex items-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); onPromote(e, template.id); }}
                >
                  <Zap size={10} />
                  Approve &amp; Promote
                </button>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[8px] font-semibold uppercase rounded-lg border border-slate-200 shadow-sm">
                  Local Asset
                </span>
              )
            ) : (
              template.requestedForGlobal ? (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-semibold uppercase rounded-lg border border-amber-100 flex items-center gap-2 shadow-sm">
                  Pending Review
                </span>
              ) : (
                <button
                  className="pointer-events-auto px-3 py-1 bg-slate-800 text-white text-[8px] font-semibold uppercase rounded-lg shadow-lg hover:bg-slate-700 transition-all flex items-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); onRequestPromotion(e, template.id); }}
                >
                  <ArrowRight size={10} />
                  Request Promotion
                </button>
              )
            )}
          </div>
        </div>

        {/* Bottom fade gradient — helps blend into info section */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '48px',
            background: 'linear-gradient(to top, white, transparent)',
            opacity: hovered ? 0 : 1,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Info section — fades out as preview expands ── */}
      <div
        className="px-6 py-4 flex flex-col justify-between flex-1 overflow-hidden"
        style={{
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        <div>
          <h4 className="text-base font-semibold text-slate-900 uppercase tracking-tight mb-1 group-hover:text-brand-default transition-colors">
            {template.name}
          </h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
            {template.description || 'Initialize this high-fidelity architecture into your build session for instant data harvesting deployment.'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap size={10} className="text-amber-500" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {template.schema?.fields?.length || 0} Components
            </span>
          </div>
          <div className="flex items-center gap-1 text-brand-default">
            <span className="text-[10px] font-semibold uppercase tracking-widest">Deploy</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const TemplateHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', label: 'All' });
  const [globalFilter, setGlobalFilter] = useState('all'); // 'all', 'true', 'false'
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

  useEffect(() => {
    fetchInitialData();
  }, [globalFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (globalFilter !== 'all') {
        params.append('global', globalFilter);
      }
      
      const [templatesRes, categoriesRes] = await Promise.all([
        api.get(`/templates?${params.toString()}`),
        api.get('/templates/categories')
      ]);
      setTemplates(templatesRes.data || []);
      setCategories(categoriesRes.data || []);
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

  const handlePromote = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/templates/${id}/promote`);
      toast.success('Strategy Promoted: Template encoded as a Global Asset.');
      fetchInitialData();
    } catch (err) {
      toast.error('Promotion Failed: Operation could not be authorized.');
    }
  };

  const handleRequestPromotion = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/templates/${id}/request-promotion`);
      toast.success('Promotion Requested: Awaiting Super Admin approval.');
      fetchInitialData();
    } catch (err) {
      toast.error('Request Failed: Could not submit promotion request.');
    }
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
              onClick={() => setSelectedCategory(selectedCategory.id === cat.id ? { id: 'all', label: 'All' } : cat)}
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
        
        {user?.roles?.includes('ROLE_SUPER_ADMIN') && (
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-400" />
            <select
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-default transition-all cursor-pointer"
            >
              <option value="all">All Assets</option>
              <option value="true">Certified (Global)</option>
              <option value="false">Uncertified (Local)</option>
              <option value="requested">Pending Promotion</option>
            </select>
          </div>
        )}
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
              <TemplateCard
                key={template.id}
                template={template}
                user={user}
                onDeploy={handleDeploy}
                onPromote={handlePromote}
                onRequestPromotion={handleRequestPromotion}
              />
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
