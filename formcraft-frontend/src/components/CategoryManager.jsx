import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Search, 
  AlertCircle,
  X,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const CategoryManager = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', label: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/templates/categories');
      setCategories(response.data);
    } catch (err) {
      toast.error('Strategic Failure: Could not synchronize category registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.label) {
      toast.error('Identification Required: Category label cannot be empty.');
      return;
    }

    try {
      // Auto-generate name from label if not provided
      const finalCategory = {
        ...newCategory,
        name: newCategory.name || newCategory.label.toUpperCase().replace(/\s+/g, '_')
      };
      
      const response = await api.post('/templates/categories', finalCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', label: '' });
      setIsAdding(false);
      toast.success('Registry Updated: New industry sector encoded.');
    } catch (err) {
      toast.error('Update Failed: Category name must be unique.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('WARNING: Deleting this category will leave its forms uncategorized. Proceed?')) return;
    
    try {
      await api.delete(`/templates/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Sector Decommissioned: Registry entry removed.');
    } catch (err) {
      toast.error('Deletion Interrupted: Category is currently in use.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
              <Settings2 className="text-brand-default" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight leading-none">Category Manager</h2>
              <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-[0.2em] mt-2 opacity-80">Organize Form Topics</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* Add Category Section */}
          <div className="mb-8">
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-brand-default hover:text-brand-default hover:bg-brand-50/30 transition-all group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-semibold uppercase tracking-widest">Add New Category</span>
            </button>

            <AnimatePresence>
              {isAdding && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddCategory}
                  className="overflow-hidden mt-4 bg-slate-50 rounded-2xl border border-slate-100 p-6"
                >
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Category Name</label>
                      <input 
                        type="text"
                        placeholder="Ex. Marketing Forms"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-brand-default transition-all"
                        value={newCategory.label}
                        onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-default text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-default/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Save Category
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag size={12} />
              Existing Form Categories
            </h4>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-40">
                <div className="w-8 h-8 border-4 border-brand-default/20 border-t-brand-default rounded-full animate-spin" />
                <p className="text-[9px] font-semibold uppercase tracking-widest">Syncing Registry...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                <AlertCircle size={32} className="mb-2" />
                <p className="text-[10px] font-semibold uppercase tracking-widest">No industry sectors registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => (
                  <motion.div 
                    layout
                    key={cat.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand-default/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-default transition-colors">
                        <Tag size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 uppercase tracking-tight">{cat.label}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{cat.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400">
             <CheckCircle2 size={14} className="text-emerald-500" />
             <span className="text-[9px] font-semibold uppercase tracking-widest">Registry Secure & Synchronized</span>
           </div>
           <button 
             onClick={onClose}
             className="px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
           >
             Close Manager
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryManager;
