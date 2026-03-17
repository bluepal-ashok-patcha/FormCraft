import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Type, 
  Hash, 
  Mail, 
  ChevronDown, 
  CheckSquare, 
  CircleDot, 
  Calendar, 
  AlignLeft,
  Settings2,
  Trash2,
  Plus,
  Save,
  Eye,
  Layers,
  Code,
  Clock,
  ArrowRight,
  ShieldCheck,
  MousePointer2,
  Zap,
  GripVertical,
  X,
  Palette,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Link as LinkIcon,
  Sparkles,
  Layout,
  Edit
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import TemplateGallery from '../components/TemplateGallery';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Answer', icon: Type, description: 'Basic text input' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numerical values only' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Standard email format' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Select from a list' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple choices' },
  { type: 'radio', label: 'Multiple Choice', icon: CircleDot, description: 'One choice only' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Calendar selector' },
  { type: 'textarea', label: 'Long Answer', icon: AlignLeft, description: 'Multiple lines of text' },
];

const FormBuilder = () => {
  const location = useLocation();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null); // id or 'header'
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [nameError, setNameError] = useState(false);
  const [previewResponses, setPreviewResponses] = useState({});
  const [activeHeader, setActiveHeader] = useState(false);
  
  // Scheduling State
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [activeTab, setActiveTab] = useState('components'); // components, scheduling, theme
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateData, setTemplateData] = useState({ name: '', description: '', categoryId: '', thumbnailUrl: '' });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Handle incoming template from Template Hub
    if (location.state?.template) {
      handleSelectTemplate(location.state.template);
      // Clear location state to prevent reload reset issues
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/templates/categories');
      setAvailableCategories(response.data);
      if (response.data.length > 0) {
        setTemplateData(prev => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to synchronize categories registry.');
    }
  };

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const minDateTime = new Date(now - offset).toISOString().slice(0, 16);

  const addField = (fieldType) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type: fieldType,
      label: `Untitled ${fieldType}`,
      required: false,
      placeholder: '',
      options: ['Option 1', 'Option 2'], 
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
    setActiveHeader(false);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const handleSave = async () => {
    if (!formName) {
      setNameError(true);
      toast.error('Name Required: Please provide a name for your form before saving.');
      setTimeout(() => setNameError(false), 2000);
      return;
    }
    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      toast.error('Timeline Error: The expiration date must be after the start date.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formName,
        schema: { fields },
        startsAt: startsAt || null,
        expiresAt: expiresAt || null,
        bannerUrl: bannerUrl || null
      };
      const response = await api.post('/forms', payload);
      toast.success('Strategy Encoded: Your form has been saved successfully.');
      setModal({
        isOpen: true,
        title: 'Success!',
        message: 'Your form has been saved successfully.',
        type: 'success',
        form: response.data 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (fields.length === 0) {
      toast.error('Architecture Required: Cannot save an empty configuration as a blueprint.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: templateData.name || formName,
        description: templateData.description,
        category: { id: templateData.categoryId },
        schema: { fields },
        thumbnailUrl: templateData.thumbnailUrl
      };
      await api.post('/templates', payload);
      toast.success('Blueprint Encoded: Architecture saved to private asset registry.');
      setShowSaveTemplateModal(false);
    } catch (err) {
      toast.error('Uplink Interrupted: Could not save blueprint.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Strategic Filtering: Only image assets are permitted for blueprint visual identities.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadLoading(true);
    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const url = response.url || response.data?.url;
      if (showSaveTemplateModal) {
        setTemplateData(prev => ({ ...prev, thumbnailUrl: url }));
      } else {
        setBannerUrl(url);
      }
      toast.success('Asset Synchronized: Visual profile uploaded successfully.');
    } catch (err) {
      toast.error('Uplink Failed: Could not transmit asset to cloud registry.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    // Normalize fields to ensure multi-choice fields have an options array
    const normalizedFields = (template.schema.fields || []).map(f => {
      if (['dropdown', 'radio', 'checkbox'].includes(f.type) && !f.options) {
        return { ...f, options: ['Option 1', 'Option 2'] };
      }
      return f;
    });
    setFields(normalizedFields);
    setFormName(template.name);
    setBannerUrl(template.thumbnailUrl || '');
    setShowGallery(false);
    toast.success('Registry Synchronized: Architecture deployed from blueprint.');
  };

  const activeField = fields.find(f => f.id === selectedField);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
      {/* Build Header */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="flex-1 flex items-center gap-4 bg-white p-2 pl-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`p-2.5 rounded-xl transition-all ${nameError ? 'bg-red-600 text-white' : 'bg-brand-default text-white'}`}>
                <Layers size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <input 
                    type="text" 
                    placeholder="Enter Form Name..."
                    className={`bg-transparent border-none outline-none text-xl font-semibold w-full placeholder:text-slate-300 ${nameError ? 'text-red-600' : 'text-slate-800'}`}
                    value={formName}
                    onChange={(e) => {
                        setFormName(e.target.value);
                        if (nameError) setNameError(false);
                    }}
                />
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Strategic Architecture Editor</span>
                </div>
            </div>
            <div className="flex items-center gap-2 pr-2">
                <button 
                    onClick={() => setShowGallery(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-default hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100"
                >
                    <Sparkles size={14} />
                    <span>Blueprints</span>
                </button>
                <div className="w-px h-6 bg-slate-100 mx-1" />
                <button 
                    onClick={() => setShowSaveTemplateModal(true)}
                    disabled={fields.length === 0}
                    className="flex items-center justify-center p-2.5 text-slate-400 hover:text-brand-default hover:bg-brand-50 rounded-xl transition-all disabled:opacity-30"
                    title="Save as Blueprint"
                >
                    <Layout size={18} />
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={loading || fields.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                >
                    {loading ? <Clock className="animate-spin" size={14} /> : <Save size={14} />}
                    <span>{loading ? 'Saving...' : 'Save Form'}</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden bg-[#F0EBF8] rounded-3xl border border-slate-200">
        {/* Left Sidebar */}
        <aside className="w-80 flex flex-col gap-6 overflow-hidden bg-white border-r border-slate-200 p-6 z-20 shadow-xl">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button 
                    onClick={() => setActiveTab('components')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'components' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Plus size={14} />
                    <span>Add Fields</span>
                </button>
                <button 
                    onClick={() => setActiveTab('scheduling')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'scheduling' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Clock size={14} />
                    <span>Schedule</span>
                </button>
                <button 
                    onClick={() => setActiveTab('theme')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'theme' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Palette size={14} />
                    <span>Appearance</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'components' ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {FIELD_TYPES.map((ft) => (
                                <button
                                    key={ft.type}
                                    onClick={() => addField(ft.type)}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('fieldType', ft.type)}
                                    className="w-full group p-4 bg-white border border-slate-200 hover:border-brand-default rounded-2xl text-left transition-all hover:shadow-md flex items-start gap-4"
                                >
                                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-default transition-all">
                                        <ft.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-xs font-semibold text-slate-800">{ft.label}</span>
                                        <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{ft.description}</span>
                                    </div>
                                    <Plus size={14} className="text-slate-200 group-hover:text-brand-default mt-1" />
                                </button>
                            ))}
                        </motion.div>
                    ) : activeTab === 'scheduling' ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200"
                        >
                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Calendar size={14} className="text-brand-default" />
                                Availability
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Starts At</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none"
                                        value={startsAt}
                                        min={minDateTime}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && new Date(val) < new Date(minDateTime)) return;
                                            setStartsAt(val);
                                            if (expiresAt && val && new Date(expiresAt) < new Date(val)) {
                                                setExpiresAt('');
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Ends At</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none"
                                        value={expiresAt}
                                        min={startsAt || minDateTime}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const compareDate = startsAt || minDateTime;
                                            if (val && new Date(val) < new Date(compareDate)) return;
                                            setExpiresAt(val);
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200"
                        >
                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Palette size={14} className="text-brand-default" />
                                Form Theme
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Banner Image</label>
                                    <div className="space-y-4">
                                        <div className="relative group aspect-[3/1] rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-default transition-all">
                                            {bannerUrl ? (
                                                <>
                                                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <label className="p-2 bg-white text-slate-900 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                                                            <Edit size={16} />
                                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                                        </label>
                                                        <button 
                                                            onClick={() => setBannerUrl('')}
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
                                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </aside>

          <main 
            onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
            }}
            onDragEnter={() => setIsDraggingOver(true)}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const fieldType = e.dataTransfer.getData('fieldType');
                if (fieldType) addField(fieldType);
            }}
            className={`flex-1 overflow-y-auto relative transition-all duration-200 p-4 md:p-8 ${isDraggingOver ? 'bg-brand-50/20' : ''}`}
          >
            <div className="max-w-2xl mx-auto space-y-4 py-8">
                {fields.length === 0 ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-40">
                        <MousePointer2 className="text-slate-300 mb-4" size={48} />
                        <p className="text-sm font-semibold text-slate-400 mb-6">Build your strategy by adding components from the sidebar.</p>
                        <button 
                            onClick={() => setShowGallery(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-default text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
                        >
                            <Sparkles size={14} />
                            Deploy Blueprint
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header Editor */}
                        <div 
                          onClick={() => { setActiveHeader(true); setSelectedField(null); }}
                          className={`group relative bg-white shadow-sm border overflow-hidden rounded-xl transition-all ${activeHeader ? 'border-brand-default ring-4 ring-brand-500/5' : 'border-slate-200'}`}
                        >
                          {bannerUrl && (
                              <div className="w-full h-40 md:h-48 overflow-hidden relative group">
                                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  {activeHeader && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                                      <label className="p-3 bg-white text-slate-900 rounded-xl cursor-pointer hover:scale-110 transition-transform">
                                          <Edit size={20} />
                                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                      </label>
                                      <button 
                                          onClick={() => setBannerUrl('')}
                                          className="p-3 bg-red-600 text-white rounded-xl hover:scale-110 transition-transform"
                                      >
                                          <Trash2 size={20} />
                                      </button>
                                    </div>
                                  )}
                              </div>
                          )}

                          {!bannerUrl && <div className="h-2.5 w-full bg-brand-default" />}
                          
                          {activeHeader && (
                            <div className="absolute top-4 right-4 flex gap-2">
                               {!bannerUrl && (
                                 <label className="p-2 bg-slate-50 text-slate-400 rounded-lg cursor-pointer hover:bg-brand-50 hover:text-brand-default transition-all shadow-sm border border-slate-100">
                                   <Palette size={14} />
                                   <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                 </label>
                               )}
                            </div>
                          )}

                          <div className="p-8">
                              {activeHeader ? (
                                <input 
                                  type="text" 
                                  className="text-3xl font-normal text-slate-900 w-full bg-transparent border-b-2 border-slate-100 focus:border-brand-default outline-none pb-2"
                                  value={formName}
                                  onChange={(e) => setFormName(e.target.value)}
                                  placeholder="Form Title"
                                  autoFocus
                                />
                              ) : (
                                <h1 className="text-3xl font-normal text-slate-900 mb-2">{formName || 'Untitled Form'}</h1>
                              )}
                              <p className="text-sm text-slate-600 font-normal mt-2 italic opacity-60">Strategic Form Portal // Design Mode</p>
                          </div>
                        </div>

                        {/* Fields Canvas */}
                        <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                            {fields.map((field, idx) => {
                                const isActive = selectedField === field.id;
                                const fieldTypeObj = FIELD_TYPES.find(t => t.type === field.type);
                                
                                return (
                                    <Reorder.Item 
                                        key={field.id} 
                                        value={field}
                                        dragListener={isActive}
                                        onClick={(e) => { e.stopPropagation(); setSelectedField(field.id); setActiveHeader(false); }}
                                        className={`group bg-white rounded-xl border shadow-sm space-y-6 transition-all relative ${
                                            isActive ? 'border-brand-default ring-4 ring-brand-500/5 p-8' : 'border-slate-200 p-8 cursor-pointer hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Drag Handle (Google Forms style top center) */}
                                        {isActive && (
                                          <div className="absolute top-2 left-0 right-0 flex justify-center opacity-40 hover:opacity-100 cursor-move">
                                              <GripVertical size={16} className="rotate-90" />
                                          </div>
                                        )}

                                        <div className="space-y-4">
                                            {isActive ? (
                                              <div className="flex gap-4">
                                                  <input 
                                                    className="flex-1 text-base font-normal text-slate-900 bg-slate-50 border-b-2 border-slate-200 focus:border-brand-default outline-none px-2 py-1"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    placeholder="Question"
                                                  />
                                                  <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-100">
                                                      {fieldTypeObj && <fieldTypeObj.icon size={16} className="text-slate-400" />}
                                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fieldTypeObj?.label}</span>
                                                  </div>
                                              </div>
                                            ) : (
                                              <label className="text-base font-normal text-slate-900 flex items-center gap-1">
                                                {field.label}
                                                {field.required && <span className="text-red-500">*</span>}
                                              </label>
                                            )}
                                        </div>
                                            
                                        <div className="relative">
                                            {field.type === 'textarea' ? (
                                                <textarea 
                                                    readOnly={!isActive}
                                                    className={`w-full bg-transparent border-b-2 border-slate-200 outline-none transition-all py-3 px-1 text-sm font-semibold text-slate-700 min-h-[50px] resize-none ${isActive ? 'focus:border-brand-default cursor-text' : 'cursor-pointer'}`} 
                                                    placeholder={field.placeholder || "Long answer text"} 
                                                />
                                            ) : field.type === 'dropdown' ? (
                                                <div className="space-y-3">
                                                  {isActive ? (
                                                    <div className="space-y-3 pl-2">
                                                      {(field.options || []).map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-3 group/opt">
                                                           <span className="text-slate-300 text-xs font-mono">{oIdx + 1}.</span>
                                                           <input 
                                                              type="text" 
                                                              className="flex-1 bg-transparent border-b border-transparent focus:border-slate-200 outline-none text-sm font-semibold text-slate-700"
                                                              value={opt}
                                                              onChange={(e) => {
                                                                  const newOpts = [...(field.options || [])];
                                                                  newOpts[oIdx] = e.target.value;
                                                                  updateField(field.id, { options: newOpts });
                                                              }}
                                                           />
                                                           <button 
                                                              onClick={() => {
                                                                  const newOpts = (field.options || []).filter((_, i) => i !== oIdx);
                                                                  updateField(field.id, { options: newOpts });
                                                              }}
                                                              className="opacity-0 group-hover/opt:opacity-100 text-slate-300 hover:text-red-600 transition-all"
                                                           >
                                                              <X size={14} />
                                                           </button>
                                                        </div>
                                                      ))}
                                                      <button 
                                                          onClick={() => {
                                                              const currentOptions = field.options || [];
                                                              updateField(field.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
                                                          }}
                                                          className="flex items-center gap-2 text-brand-default text-[10px] font-bold uppercase tracking-widest pl-6 hover:translate-x-1 transition-transform"
                                                      >
                                                          <Plus size={14} /> Add Option
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <div className="relative">
                                                      <select disabled className="w-full bg-transparent border-b-2 border-slate-200 py-3 px-1 text-sm font-semibold text-slate-700 appearance-none pointer-events-none">
                                                          <option value="">{field.placeholder || 'Choose an option'}</option>
                                                      </select>
                                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                    </div>
                                                  )}
                                                </div>
                                            ) : field.type === 'date' ? (
                                                <input 
                                                    type="date" 
                                                    readOnly
                                                    className="w-full bg-transparent border-b-2 border-slate-200 py-3 px-1 text-sm font-semibold text-slate-700 pointer-events-none" 
                                                />
                                            ) : field.type === 'radio' || field.type === 'checkbox' ? (
                                                <div className="space-y-4">
                                                    {(field.options || []).map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-3 group/opt">
                                                            <div className={`h-5 w-5 border border-slate-300 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                                                            {isActive ? (
                                                              <input 
                                                                  type="text" 
                                                                  className="flex-1 bg-transparent border-b border-transparent focus:border-slate-200 outline-none text-sm font-semibold text-slate-700"
                                                                  value={opt}
                                                                  onChange={(e) => {
                                                                      const newOpts = [...(field.options || [])];
                                                                      newOpts[oIdx] = e.target.value;
                                                                      updateField(field.id, { options: newOpts });
                                                                  }}
                                                              />
                                                            ) : (
                                                              <span className="text-sm font-normal text-slate-700">{opt}</span>
                                                            )}
                                                            {isActive && (
                                                              <button 
                                                                  onClick={() => {
                                                                      const newOpts = (field.options || []).filter((_, i) => i !== oIdx);
                                                                      updateField(field.id, { options: newOpts });
                                                                  }}
                                                                  className="opacity-0 group-hover/opt:opacity-100 text-slate-300 hover:text-red-600 transition-all"
                                                              >
                                                                  <X size={14} />
                                                              </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {isActive && (
                                                      <button 
                                                          onClick={() => {
                                                              const currentOptions = field.options || [];
                                                              updateField(field.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
                                                          }}
                                                          className="flex items-center gap-2 text-brand-default text-[10px] font-bold uppercase tracking-widest pl-8 hover:translate-x-1 transition-transform"
                                                      >
                                                          <Plus size={14} /> Add Option
                                                      </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    readOnly={!isActive}
                                                    className={`w-full bg-transparent border-b-2 border-slate-200 outline-none transition-all py-3 px-1 text-sm font-semibold text-slate-700 ${isActive ? 'focus:border-brand-default cursor-text' : 'cursor-pointer'}`} 
                                                    placeholder={isActive && field.placeholder ? field.placeholder : "Short answer text"} 
                                                />
                                            )}
                                        </div>

                                        {/* Contextual Footer (Only Active) */}
                                        {isActive && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-6"
                                          >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Placeholder</span>
                                                <input 
                                                  className="bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold text-slate-700 w-32 focus:border-brand-default outline-none"
                                                  value={field.placeholder}
                                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-px h-6 bg-slate-100" />
                                            <button 
                                                onClick={() => {
                                                  const newField = { ...field, id: Math.random().toString(36).substr(2, 9) };
                                                  setFields([...fields, newField]);
                                                  setSelectedField(newField.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-brand-default hover:bg-brand-50 rounded-lg transition-all"
                                                title="Duplicate"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button 
                                                onClick={() => removeField(field.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="w-px h-6 bg-slate-100" />
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Required</span>
                                                <button 
                                                    onClick={() => updateField(field.id, { required: !field.required })}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${field.required ? 'bg-brand-default' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${field.required ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                          </motion.div>
                                        )}
                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>
                        
                        {/* Branding Footer (Non-editable) */}
                        <div className="flex justify-between items-center flex-row-reverse px-2 pt-12 pb-20">
                            <button disabled className="px-6 h-10 bg-brand-default opacity-40 text-white rounded font-medium text-sm cursor-not-allowed">
                                Final Submission
                            </button>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-widest opacity-60">
                                <ShieldCheck size={12} />
                                <span>FormCraft Protected Framework</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
          </main>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        footer={
          <div className="flex gap-3 w-full">
            <button 
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="flex-1 h-11 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-semibold uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
            >
                Dismiss
            </button>
            <button 
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="flex-1 btn-primary h-11 text-[10px] font-semibold uppercase tracking-[0.2em]"
            >
                Ready for Uplink
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${modal.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-brand-50 border-brand-100 text-brand-default'}`}>
              {modal.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-tight leading-none">{modal.title}</h3>
                {modal.type === 'success' && (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-widest">Encoded</span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest opacity-80 leading-tight">
                {modal.type === 'error' ? 'Operational Halt' : 'Transaction Complete'} // {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-4">
            {modal.message}
          </p>

          {modal.type === 'success' && modal.form && (
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LinkIcon size={10} className="text-brand-default" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Public Uplink</span>
                    </div>
                </div>
                
                <div className="relative group">
                    <input 
                        readOnly 
                        value={`${window.location.origin}/f/${modal.form.slug}`}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-brand-default transition-all"
                    />
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/f/${modal.form.slug}`);
                            toast.success('Link Secured: Copied to clipboard.');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-all shadow-md active:scale-95"
                        title="Copy to Clipboard"
                    >
                        <Copy size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Signal status: ACTIVE // BROADCASTING</span>
                </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Save as Template Modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        title="Blueprint Encoding"
        footer={
          <div className="flex gap-3 w-full">
            <button 
                onClick={() => setShowSaveTemplateModal(false)}
                className="flex-1 h-11 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-semibold uppercase tracking-widest border border-slate-100"
            >
                Abort
            </button>
            <button 
                onClick={handleSaveAsTemplate}
                disabled={loading || !templateData.name}
                className="flex-1 btn-primary h-11 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20"
            >
                {loading ? 'Processing...' : 'Secure Blueprint'}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-default border border-brand-100">
               <Layout size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-tight leading-none">Save to Registry</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Convert Architecture to Asset</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Blueprint Designation</label>
              <input 
                type="text" 
                placeholder="Ex. Customer Satisfaction v2..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-brand-default transition-all"
                value={templateData.name}
                onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Strategic Category</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-brand-default transition-all"
                value={templateData.categoryId}
                onChange={(e) => setTemplateData({...templateData, categoryId: e.target.value})}
              >
                 {availableCategories.map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.label}</option>
                 ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Protocol Description</label>
              <textarea 
                rows="3"
                placeholder="Describe the utility and deployment scope of this template..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-brand-default transition-all resize-none"
                value={templateData.description}
                onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Visual Identity (Cloudinary)</label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Image URL auto-populates on upload..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-4 py-3 text-[10px] font-semibold text-slate-800 outline-none focus:border-brand-default transition-all"
                      value={templateData.thumbnailUrl}
                      onChange={(e) => setTemplateData({...templateData, thumbnailUrl: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                     <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-default rounded-xl text-[9px] font-semibold uppercase tracking-widest cursor-pointer transition-all border border-brand-100">
                      {uploadLoading ? <Clock size={12} className="animate-spin" /> : <Plus size={12} />}
                      <span>{uploadLoading ? 'Uploading...' : 'Upload Image'}</span>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploadLoading} />
                    </label>
                  </div>
                </div>
                {templateData.thumbnailUrl && (
                  <div className="w-24 h-24 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0">
                    <img src={templateData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Deploy a visual profile to distinguish this blueprint</p>
            </div>
          </div>
        </div>
      </Modal>

      <TemplateGallery 
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
};

export default FormBuilder;
