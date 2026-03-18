import { useState, useEffect, useRef } from 'react';
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
  Edit,
  Star,
  Sliders
} from 'lucide-react';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import TemplateGallery from '../components/TemplateGallery';

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

const FIELD_TYPES = [
  { type: 'text', label: 'Short Answer', icon: Type, description: 'Basic text input' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numerical values only' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Standard email format' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Select from a list' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple choices' },
  { type: 'radio', label: 'Multiple Choice', icon: CircleDot, description: 'One choice only' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Calendar selector' },
  { type: 'textarea', label: 'Long Answer', icon: AlignLeft, description: 'Multiple lines of text' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star-based rating' },
  { type: 'linear-scale', label: 'Linear Scale', icon: Sliders, description: 'Range scale selector' },
];

const FormBuilder = () => {
  const location = useLocation();
  const mainRef = useRef(null);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null); // id or 'header'
  const [openTypeDropdownId, setOpenTypeDropdownId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [nameError, setNameError] = useState(false);
  const [previewResponses, setPreviewResponses] = useState({});
  const [activeHeader, setActiveHeader] = useState(false);

  // Scheduling State
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [activeTab, setActiveTab] = useState('components'); // components, scheduling, theme
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(null); // field.id
  const [templateData, setTemplateData] = useState({ name: '', description: '', categoryId: '', thumbnailUrl: '' });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // AI Regex State
  const [aiPrompt, setAiPrompt] = useState({});
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Handle incoming template from Template Hub
    if (location.state?.template) {
      handleSelectTemplate(location.state.template);
      // Clear location state to prevent reload reset issues
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (selectedField && selectedField !== 'header') {
      // Use setTimeout to ensure the DOM has updated if it's a new field
      const timer = setTimeout(() => {
        const element = document.getElementById(selectedField);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedField]);

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

  const handleGenerateAiRegex = async (fieldId) => {
    const prompt = aiPrompt[fieldId];
    if (!prompt || !prompt.trim()) {
      toast.error('AI Protocol: Please describe the validation rule first.');
      return;
    }
    
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-regex', { prompt });
      if (res.data && res.data.regex) {
        toast.success('AI Synergy: Neural validation logic synthesized.');
        
        // Use functional setFields to ensure we have the absolute latest state
        setFields(prevFields => {
          return prevFields.map(f => {
            if (f.id === fieldId) {
              return {
                ...f,
                validation: { 
                  ...(f.validation || {}), 
                  regex: res.data.regex,
                  errorMessage: res.data.errorMessage || ''
                }
              };
            }
            return f;
          });
        });

        // Clear the prompt input
        setAiPrompt(prev => ({ ...prev, [fieldId]: '' }));
      }
    } catch (err) {
      console.error(err);
      toast.error('AI Failure: Could not establish connection to the neural network.');
    } finally {
      setAiGenerating(false);
    }
  };

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const minDateTime = new Date(now - offset).toISOString().slice(0, 16);

  const addField = (fieldType, index = fields.length) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type: fieldType.toLowerCase(),
      label: `Untitled ${fieldType}`,
      required: false,
      placeholder: '',
      options: ['Option 1', 'Option 2'],
      max: fieldType.toLowerCase() === 'rating' || fieldType.toLowerCase() === 'linear-scale' ? 5 : undefined,
      min: fieldType.toLowerCase() === 'linear-scale' ? 1 : undefined,
      minLabel: fieldType.toLowerCase() === 'linear-scale' ? 'Lowest' : undefined,
      maxLabel: fieldType.toLowerCase() === 'linear-scale' ? 'Highest' : undefined
    };

    // Support inserting at index
    const newFields = [...fields];
    newFields.splice(index, 0, newField);
    setFields(newFields);
    setSelectedField(newField.id);
    setActiveHeader(false);
  };

  const updateField = (id, updates) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
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
        bannerUrl: bannerUrl || null,
        themeColor: themeColor || '#6366f1'
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

  // Stagger-cascade: adds fields one-by-one with animated delay
  const handleDeployFields = ({ fields: newFields, name, bannerUrl: banner }) => {
    // If setting a completely new form name from template, clear fields.
    setFormName(name);
    setBannerUrl(banner || '');
    setSelectedField(null);
    setActiveHeader(false);

    // Smoothly scroll the canvas back to the top so the user sees the cascade animation
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Give each field a fresh unique animation ID prefix so React guarantees it mounts fresh
    const deploySessionId = Math.random().toString(36).substr(2, 5);
    
    // Stagger process: we add to the existing fields array instead of resetting it completely if it already has items
    const startIdx = fields.length;

    newFields.forEach((field, i) => {
      setTimeout(() => {
        setFields(prev => {
          // ensure the field has a perfectly unique session key for animation
          const fieldWithAnimKey = { ...field, animKey: `${deploySessionId}-${field.id}` };
          return [...prev, fieldWithAnimKey];
        });
      }, i * 120); // 120ms stagger between each field cascade
    });

    toast.success(`✦ Deploying ${newFields.length} fields into the canvas...`);
  };

  const activeField = fields.find(f => f.id === selectedField);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Build Header Area */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 z-30">
        <div className="flex items-center justify-between gap-10">
          {/* Project Hub: Branding & Name */}
          <div className="flex-1 flex items-center gap-5 group">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Architectural Identity..."
                  className={`bg-transparent border-none outline-none text-xl font-bold w-full transition-all placeholder:text-slate-200 placeholder:font-medium ${nameError ? 'text-red-500' : 'text-slate-800 focus:text-brand-default'
                    }`}
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                />
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 text-[9px] font-bold text-brand-default rounded-md uppercase tracking-wider border border-brand-200/50">
                  <Edit size={8} className="text-brand-default/60" />
                  Live Architect
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                  {fields.length} Components Integrated
                </span>
              </div>
            </div>
          </div>

          {/* Action Deck: Blueprints & Save */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setShowGallery(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-brand-default transition-all"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Templates</span>
              </button>
              <div className="w-px h-4 bg-slate-200 mx-0.5" />
              <button
                onClick={() => setShowSaveTemplateModal(true)}
                disabled={fields.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-brand-default transition-all disabled:opacity-30"
                title="Register Template"
              >
                <Layout size={14} className="text-brand-default/60" />
                <span>Save Template</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading || fields.length === 0}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-brand-default text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-all shadow-sm shadow-brand-500/10 disabled:opacity-50 min-w-[140px] justify-center"
            >
              {loading ? (
                <Clock className="animate-spin" size={14} />
              ) : (
                <Save size={14} className="fill-current" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden bg-[#F0EBF8] border-t border-slate-200">
        {/* Left Sidebar */}
        <aside className="w-80 flex flex-col gap-6 overflow-y-auto no-scrollbar bg-white border-r border-slate-200 px-3 py-6 z-20 shadow-xl relative overflow-hidden">

          {/* Template Gallery — slides in over the sidebar */}
          <TemplateGallery
            isOpen={showGallery}
            onClose={() => setShowGallery(false)}
            onSelect={handleSelectTemplate}
            onDeployFields={handleDeployFields}
            onTemplateDragStart={() => setIsDraggingTemplate(true)}
            onTemplateDragEnd={() => setIsDraggingTemplate(false)}
          />

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

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
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
                    
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Theme Color</label>
                      <div className="grid grid-cols-4 gap-3">
                        {DEFAULT_THEMES.map((theme) => (
                          <button
                            key={theme.color}
                            type="button"
                            onClick={() => setThemeColor(theme.color)}
                            className={`aspect-square rounded-full border-2 transition-all p-1 ${themeColor === theme.color ? 'border-brand-default scale-110 shadow-lg shadow-brand-500/10' : 'border-transparent hover:scale-105'}`}
                            title={theme.name}
                          >
                            <div className="w-full h-full rounded-full shadow-sm" style={{ backgroundColor: theme.color }} />
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-slate-400">Custom Spectrum</span>
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span className="text-[8px] font-mono font-bold text-slate-400">{themeColor.toUpperCase()}</span>
                          <input 
                            type="color" 
                            value={themeColor} 
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                          />
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
          ref={mainRef}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragEnter={() => setIsDraggingOver(true)}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            setIsDraggingTemplate(false);

            // Handle template drop
            const templatePayload = e.dataTransfer.getData('templateDrop');
            if (templatePayload) {
              try {
                const { name, bannerUrl: banner, fields: tplFields } = JSON.parse(templatePayload);
                handleDeployFields({ fields: tplFields, name, bannerUrl: banner });
                setShowGallery(false);
              } catch {}
              return;
            }

            // Handle individual field drop
            const fieldType = e.dataTransfer.getData('fieldType');
            if (fieldType) {
              const dropY = e.clientY;
              const fieldElements = document.querySelectorAll('.form-field-item');
              let dropIndex = fields.length;
              for (let i = 0; i < fieldElements.length; i++) {
                const rect = fieldElements[i].getBoundingClientRect();
                if (dropY < rect.top + rect.height / 2) { dropIndex = i; break; }
              }
              addField(fieldType, dropIndex);
            }
          }}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative transition-all duration-300 p-4 md:p-8"
          style={{ backgroundColor: isDraggingOver ? `${themeColor}18` : `${themeColor}0a` }}
        >
          {/* Drop target overlay when dragging a template */}
          {isDraggingTemplate && (
            <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 z-50 flex flex-col items-center justify-center pointer-events-none">
              <Sparkles size={28} className="text-brand-default mb-2 animate-pulse" />
              <p className="text-xs font-bold text-brand-default uppercase tracking-widest">Drop to deploy template</p>
            </div>
          )}
          <div className="max-w-4xl mx-auto space-y-4 py-12 px-4 pb-32">
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
                  className={`group relative bg-white transition-all duration-300 ${activeHeader ? 'shadow-2xl z-40 rounded-xl border-l-[6px]' : 'border border-slate-200 shadow-sm rounded-xl'}`}
                  style={activeHeader ? { borderLeftColor: themeColor || '#6366f1', borderTop: 'none' } : {}}
                >
                  {/* Strategic Color Identity Bar */}
                  <div 
                    className="h-2.5 w-full transition-all duration-500 ease-in-out rounded-t-xl" 
                    style={{ backgroundColor: themeColor || '#6366f1' }} 
                  />
                  
                  {/* Vertical focus indicator is now handled by border-l-[6px] for better alignment */}
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

                  {activeHeader && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      {!bannerUrl && (
                        <label className="p-2 bg-slate-50 text-slate-400 rounded-lg cursor-pointer hover:bg-slate-100 transition-all shadow-sm border border-slate-100">
                          <Plus size={14} />
                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="p-8">
                    {activeHeader ? (
                      <input
                        type="text"
                        className="text-3xl font-normal text-slate-900 w-full bg-transparent border-b-2 border-slate-100 outline-none pb-2 transition-all"
                        style={{ borderBottomColor: activeHeader ? (themeColor || '#6366f1') : '' }}
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
                    const fieldTypeObj = FIELD_TYPES.find(t => t.type === field.type?.toLowerCase());

                    return (
                      <Reorder.Item
                        key={field.animKey || field.id}
                        id={field.id}
                        value={field}
                        layout
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 1 }}
                        dragListener={true} // Enable drag for all items for better UX
                        onClick={(e) => { e.stopPropagation(); setSelectedField(field.id); setActiveHeader(false); }}
                        className={`form-field-item group bg-white rounded-xl transition-all duration-300 ${isActive ? 'shadow-2xl py-10 px-8 z-40 border-l-[6px]' : 'border border-slate-200 p-8 cursor-pointer hover:border-slate-300 shadow-sm z-0'
                          }`}
                        style={isActive ? { borderLeftColor: themeColor || '#6366f1' } : {}}
                        whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                      >
                        {/* google-style active indicator is now handled by border-l-[6px] for better cross-component consistency */}
                        {/* Drag Handle (Google Forms style top center) */}
                        {isActive && (
                          <div className="absolute top-2 left-0 right-0 flex justify-center opacity-40 hover:opacity-100 cursor-move">
                            <GripVertical size={16} className="rotate-90" />
                          </div>
                        )}

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isActive ? 'edit' : 'view'}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-4"
                          >
                            {isActive ? (
                              <div className="flex gap-4">
                                <input
                                  className="flex-1 text-base font-normal text-slate-900 bg-transparent border-b border-slate-200 focus:border-b-2 focus:border-brand-default outline-none px-1 py-3 transition-all placeholder:text-slate-300"
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  placeholder="Question"
                                />
                                <div className="relative group/type min-w-[200px]">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenTypeDropdownId(openTypeDropdownId === field.id ? null : field.id);
                                    }}
                                    className="flex items-center gap-3 bg-white border border-slate-200 rounded px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                  >
                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                      {fieldTypeObj && <fieldTypeObj.icon size={18} className="text-slate-500 shrink-0" />}
                                      <span className="text-sm font-normal text-slate-700 truncate">{fieldTypeObj ? fieldTypeObj.label : 'Select Type'}</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openTypeDropdownId === field.id ? 'rotate-180' : ''}`} />
                                  </div>

                                  {openTypeDropdownId === field.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setOpenTypeDropdownId(null)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="absolute right-0 left-0 top-full mt-2 bg-white rounded-lg shadow-2xl border border-slate-100 z-50 overflow-hidden py-2"
                                      >
                                        {FIELD_TYPES.map(type => (
                                          <button
                                            key={type.type}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateField(field.id, { type: type.type });
                                              setOpenTypeDropdownId(null);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${field.type === type.type ? 'bg-slate-50' : ''}`}
                                          >
                                            <type.icon size={18} className={`${field.type === type.type ? 'text-brand-default' : 'text-slate-400'}`} />
                                            <div className="flex flex-col">
                                              <span className={`text-[13px] font-medium ${field.type === type.type ? 'text-brand-default' : 'text-slate-700'}`}>{type.label}</span>
                                              {field.type === type.type && <span className="text-[10px] text-brand-default relative bottom-0.5">Current selection</span>}
                                            </div>
                                            {field.type === type.type && (
                                              <CheckCircle2 size={14} className="ml-auto text-brand-default" />
                                            )}
                                          </button>
                                        ))}
                                      </motion.div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <label className="text-base font-normal text-slate-900 flex items-center gap-1">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                              </label>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        <div className="relative mt-6">
                          {field.type?.toLowerCase() === 'textarea' ? (
                            <textarea
                              readOnly={!isActive}
                              className={`w-full bg-transparent border-b-2 border-slate-200 outline-none transition-all py-3 px-1 text-sm font-semibold text-slate-700 min-h-[50px] resize-none ${isActive ? 'focus:border-brand-default cursor-text' : 'cursor-pointer'}`}
                              placeholder={field.placeholder || "Long answer text"}
                            />
                          ) : field.type?.toLowerCase() === 'dropdown' ? (
                            <div className="space-y-3">
                              {isActive ? (
                                <div className="space-y-3 pl-2">
                                  {(field.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-3 group/opt">
                                      <span className="text-slate-400 text-sm">{oIdx + 1}.</span>
                                      <input
                                        type="text"
                                        className="flex-1 bg-transparent border-b border-transparent focus:border-slate-200 outline-none text-sm font-normal text-slate-700 py-1"
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
                                        className="opacity-0 group-hover/opt:opacity-100 text-slate-400 hover:text-red-600 transition-all p-1"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const currentOptions = field.options || [];
                                      updateField(field.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
                                    }}
                                    className="text-brand-default text-sm font-normal hover:underline pt-2 pl-7 block w-fit"
                                  >
                                    Add option
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
                          ) : field.type?.toLowerCase() === 'rating' ? (
                            <div className="flex items-center gap-2 group/rating">
                              {[...Array(field.max || 5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewResponses(prev => ({ ...prev, [field.id]: i + 1 }));
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Star
                                    size={28}
                                    className={`transition-all duration-300 ${i < (previewResponses[field.id] || 0)
                                        ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                        : "text-slate-200 hover:text-amber-200"
                                      }`}
                                  />
                                </motion.div>
                              ))}
                              <span className="text-[10px] font-bold text-slate-400 ml-4 uppercase tracking-widest opacity-0 group-hover/rating:opacity-100 transition-opacity whitespace-nowrap">
                                {previewResponses[field.id] ? `${previewResponses[field.id]} / ${field.max || 5}` : `Select Rating`}
                              </span>
                            </div>
                          ) : field.type?.toLowerCase() === 'linear-scale' ? (
                            <div className="py-4">
                              {isActive ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {/* Range Selectors Row */}
                                  <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <select
                                      className="bg-white border border-slate-200 rounded px-3 py-2 outline-none focus:border-brand-default transition-all cursor-pointer min-w-[60px]"
                                      value={field.min ?? 1}
                                      onChange={(e) => updateField(field.id, { min: parseInt(e.target.value) })}
                                    >
                                      {[0, 1].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                    <span className="font-medium">to</span>
                                    <select
                                      className="bg-white border border-slate-200 rounded px-3 py-2 outline-none focus:border-brand-default transition-all cursor-pointer min-w-[60px]"
                                      value={field.max ?? 5}
                                      onChange={(e) => updateField(field.id, { max: parseInt(e.target.value) })}
                                    >
                                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                  </div>

                                  {/* Vertical Label Inputs */}
                                  <div className="space-y-4 max-w-md">
                                    <div className="flex items-center gap-6">
                                      <span className="text-sm font-medium text-slate-400 w-4">{field.min || 0}</span>
                                      <input
                                        className="flex-1 bg-transparent border-b border-slate-200 focus:border-brand-default outline-none pb-1.5 text-sm transition-all placeholder:text-slate-300"
                                        value={field.minLabel || ''}
                                        placeholder="Label (optional)"
                                        onChange={(e) => updateField(field.id, { minLabel: e.target.value })}
                                      />
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <span className="text-sm font-medium text-slate-400 w-4">{field.max || 5}</span>
                                      <input
                                        className="flex-1 bg-transparent border-b border-slate-200 focus:border-brand-default outline-none pb-1.5 text-sm transition-all placeholder:text-slate-300"
                                        value={field.maxLabel || ''}
                                        placeholder="Label (optional)"
                                        onChange={(e) => updateField(field.id, { maxLabel: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-8 py-4 px-4">
                                  <span className="text-sm text-slate-800 mt-6 font-normal min-w-[60px] text-right">{field.minLabel || ''}</span>
                                  <div className="flex items-center gap-6">
                                    {Array.from({ length: (field.max || 5) - (field.min || 1) + 1 }, (_, i) => (field.min || 1) + i).map((val) => (
                                      <div key={val} className="flex flex-col items-center gap-3">
                                        <span className="text-sm text-slate-600 font-normal">{val}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${previewResponses[field.id] === val
                                            ? 'border-brand-default'
                                            : 'border-slate-300'
                                          }`}>
                                          {previewResponses[field.id] === val && <div className="w-3 h-3 rounded-full bg-brand-default" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <span className="text-sm text-slate-800 mt-6 font-normal min-w-[60px] text-left">{field.maxLabel || ''}</span>
                                </div>
                              )}
                            </div>
                          ) : field.type?.toLowerCase() === 'date' ? (
                            <input
                              type="date"
                              readOnly
                              className="w-full bg-transparent border-b-2 border-slate-200 py-3 px-1 text-sm font-semibold text-slate-700 pointer-events-none"
                            />
                          ) : field.type?.toLowerCase() === 'radio' || field.type?.toLowerCase() === 'checkbox' ? (
                            <div className="space-y-4">
                              {(field.options || []).map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3 group/opt">
                                  <div className={`h-5 w-5 border border-slate-300 shrink-0 ${field.type?.toLowerCase() === 'radio' ? 'rounded-full' : 'rounded-sm'}`} />
                                  {isActive ? (
                                    <input
                                      type="text"
                                      className="flex-1 bg-transparent border-b border-transparent focus:border-slate-200 outline-none text-sm font-normal text-slate-700 py-1"
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
                                      className="opacity-0 group-hover/opt:opacity-100 text-slate-400 hover:text-red-600 transition-all p-1"
                                    >
                                      <X size={16} />
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
                                  className="text-brand-default text-sm font-normal hover:underline pt-2 pl-8 block w-fit"
                                >
                                  Add option
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
                            {!['rating', 'linear-scale', 'date', 'radio', 'checkbox', 'dropdown'].includes(field.type?.toLowerCase()) && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Placeholder</span>
                                <input
                                  className="bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold text-slate-700 w-32 focus:border-brand-default outline-none"
                                  value={field.placeholder || ''}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                />
                              </div>
                            )}
                            {field.type?.toLowerCase() === 'rating' && (
                              <>
                                <div className="w-px h-6 bg-slate-100" />
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Stars</span>
                                  <select
                                    className="bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                    value={field.max ?? 5}
                                    onChange={(e) => updateField(field.id, { max: parseInt(e.target.value) })}
                                  >
                                    {[3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </div>
                              </>
                            )}
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
                            <div className="w-px h-6 bg-slate-100" />
                            <button
                              onClick={() => setShowAdvanced(showAdvanced === field.id ? null : field.id)}
                              className={`p-2 rounded-lg transition-all ${showAdvanced === field.id ? 'bg-brand-default text-white' : 'text-slate-400 hover:text-brand-default hover:bg-brand-50'}`}
                              title="Validation & Defaults"
                            >
                              <Settings2 size={18} />
                            </button>
                          </motion.div>
                        )}

                        {/* Advanced Settings Drawer */}
                        {isActive && showAdvanced === field.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-6 pt-6 border-t border-slate-100 space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                              {/* Default Value Column */}
                              <div className="flex flex-col space-y-4 h-full">
                                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                  <Zap size={14} className="text-brand-default" />
                                  Default Initialization
                                </h4>
                                <div className="flex-1 flex flex-col justify-end">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Primary Value</label>

                                    {/* Text/Number/Textarea Default */}
                                    {['text', 'number', 'textarea', 'email'].includes(field.type?.toLowerCase()) && (
                                      <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 outline-none focus:border-brand-default transition-all"
                                        value={field.defaultValue || ''}
                                        placeholder={field.type === 'number' ? "0" : "Static pre-fill data..."}
                                        onChange={(e) => updateField(field.id, { defaultValue: field.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                      />
                                    )}

                                    {/* Dropdown/Radio Default */}
                                    {['dropdown', 'radio'].includes(field.type?.toLowerCase()) && (
                                      <select
                                        className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 outline-none focus:border-brand-default transition-all appearance-none cursor-pointer"
                                        value={field.defaultValue || ''}
                                        onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                                      >
                                        <option value="">No Default Selection</option>
                                        {(field.options || []).map((opt, i) => (
                                          <option key={i} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                    )}

                                    {/* Checkbox Default (Multi-select) */}
                                    {field.type?.toLowerCase() === 'checkbox' && (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[120px] overflow-y-auto space-y-2">
                                        {(field.options || []).map((opt, i) => {
                                          const isSelected = (field.defaultValue || []).includes(opt);
                                          return (
                                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                  const current = field.defaultValue || [];
                                                  const newValue = e.target.checked ? [...current, opt] : current.filter(item => item !== opt);
                                                  updateField(field.id, { defaultValue: newValue });
                                                }}
                                                className="accent-brand-default rounded"
                                              />
                                              <span className="text-[10px] font-semibold text-slate-600 transition-colors group-hover:text-brand-default">{opt}</span>
                                            </label>
                                          );
                                        })}
                                        {(field.options || []).length === 0 && <p className="text-[10px] text-slate-400 italic">No options defined yet</p>}
                                      </div>
                                    )}

                                    {/* Rating Default */}
                                    {field.type?.toLowerCase() === 'rating' && (
                                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4">
                                        {[...Array(field.max || 5)].map((_, i) => (
                                          <button
                                            key={i}
                                            onClick={() => updateField(field.id, { defaultValue: i + 1 })}
                                            className="transition-transform hover:scale-110 active:scale-90"
                                          >
                                            <Star
                                              size={20}
                                              className={`transition-all ${(field.defaultValue || 0) > i
                                                  ? "fill-amber-400 text-amber-400"
                                                  : "text-slate-300"
                                                }`}
                                            />
                                          </button>
                                        ))}
                                        <button
                                          onClick={() => updateField(field.id, { defaultValue: undefined })}
                                          className="ml-auto text-[8px] font-bold text-slate-400 uppercase hover:text-red-500 transition-colors"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    )}

                                    {/* Linear Scale Default */}
                                    {field.type?.toLowerCase() === 'linear-scale' && (
                                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        {Array.from({ length: (field.max || 5) - (field.min || 0) + 1 }, (_, i) => (field.min || 0) + i).map((val) => {
                                          const isSelected = field.defaultValue === val;
                                          return (
                                            <button
                                              key={val}
                                              onClick={() => updateField(field.id, { defaultValue: val })}
                                              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${isSelected
                                                  ? 'bg-brand-default text-white shadow-md'
                                                  : 'bg-white border border-slate-100 text-slate-400 hover:border-brand-default hover:text-brand-default'
                                                }`}
                                            >
                                              {val}
                                            </button>
                                          );
                                        })}
                                        <button
                                          onClick={() => updateField(field.id, { defaultValue: undefined })}
                                          className="ml-auto text-[8px] font-bold text-slate-400 uppercase hover:text-red-500 transition-colors"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    )}

                                    {/* Date Default */}
                                    {field.type?.toLowerCase() === 'date' && (
                                      <input
                                        type="date"
                                        className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                        value={field.defaultValue || ''}
                                        onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Validation Rules Column */}
                                <div className="flex flex-col space-y-4 h-full">
                                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    Validation Logic
                                  </h4>

                                  <div className="flex-1 flex flex-col space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      {['text', 'textarea', 'email'].includes(field.type?.toLowerCase()) ? (
                                        <>
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Min Length</label>
                                            <input
                                              type="number"
                                              className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                              value={field.validation?.minLength || ''}
                                              placeholder="Chars"
                                              onChange={(e) => updateField(field.id, {
                                                validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                                              })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Max Length</label>
                                            <input
                                              type="number"
                                              className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                              value={field.validation?.maxLength || ''}
                                              placeholder="Chars"
                                              onChange={(e) => updateField(field.id, {
                                                validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                                              })}
                                            />
                                          </div>
                                        </>
                                      ) : field.type?.toLowerCase() === 'number' ? (
                                        <>
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Min Value</label>
                                            <input
                                              type="number"
                                              className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                              value={field.validation?.min || ''}
                                              placeholder="Value"
                                              onChange={(e) => updateField(field.id, {
                                                validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                                              })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Max Value</label>
                                            <input
                                              type="number"
                                              className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                              value={field.validation?.max || ''}
                                              placeholder="Value"
                                              onChange={(e) => updateField(field.id, {
                                                validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                                              })}
                                            />
                                          </div>
                                        </>
                                      ) : null}
                                    </div>

                                    {['text', 'textarea', 'email', 'number'].includes(field.type?.toLowerCase()) && (
                                      <div className="space-y-4">
                                        {/* AI Regex Generator Section */}
                                        <div className="bg-gradient-to-r from-brand-50 to-indigo-50/30 p-4 rounded-xl border border-brand-100/50 space-y-3 relative overflow-hidden">
                                          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                            <Sparkles size={40} className="text-brand-default" />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-brand-default" />
                                            <label className="text-[10px] font-bold text-brand-default uppercase tracking-wider">AI Regex Generator</label>
                                          </div>
                                          <div className="flex items-center gap-2 relative z-10">
                                            <input
                                              type="text"
                                              className="flex-1 bg-white border border-brand-200/50 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:border-brand-default outline-none shadow-sm placeholder:text-slate-400"
                                              placeholder="e.g. Must be exactly 12 digits..."
                                              value={aiPrompt[field.id] || ''}
                                              onChange={(e) => setAiPrompt(prev => ({ ...prev, [field.id]: e.target.value }))}
                                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateAiRegex(field.id); } }}
                                            />
                                            <button
                                              onClick={(e) => { e.preventDefault(); handleGenerateAiRegex(field.id); }}
                                              disabled={aiGenerating || !aiPrompt[field.id]}
                                              className="bg-brand-default text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-500/20 whitespace-nowrap min-w-[90px] flex justify-center"
                                            >
                                              {aiGenerating ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate ✦'}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Custom Regex Pattern</label>
                                          <input
                                            type="text"
                                            className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none font-mono"
                                            value={field.validation?.regex || ''}
                                            placeholder="e.g. ^[0-9]{5}$"
                                            onChange={(e) => updateField(field.id, {
                                              validation: { ...field.validation, regex: e.target.value }
                                            })}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div className="mt-auto space-y-2">
                                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Custom Error Message</label>
                                      <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-slate-200 py-1.5 px-0 text-xs font-semibold text-slate-700 focus:border-brand-default outline-none"
                                        value={field.validation?.errorMessage || ''}
                                        placeholder="Override standard failure report..."
                                        onChange={(e) => updateField(field.id, {
                                          validation: { ...field.validation, errorMessage: e.target.value }
                                        })}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Strategic Category</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-brand-default transition-all"
                value={templateData.categoryId}
                onChange={(e) => setTemplateData({ ...templateData, categoryId: e.target.value })}
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
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
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
                      onChange={(e) => setTemplateData({ ...templateData, thumbnailUrl: e.target.value })}
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

    </div>
  );
};

export default FormBuilder;
