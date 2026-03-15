import { useState } from 'react';
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
  Download
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Modal from '../components/Modal';

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
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [nameError, setNameError] = useState(false);
  
  // Scheduling State
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [activeTab, setActiveTab] = useState('components'); // components, scheduling

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
      setModal({
        isOpen: true,
        title: 'Name Required',
        message: 'Please provide a name for your form before saving.',
        type: 'error'
      });
      setTimeout(() => setNameError(false), 2000);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formName,
        schema: { fields },
        startsAt: startsAt || null,
        expiresAt: expiresAt || null
      };
      const response = await api.post('/forms', payload);
      setModal({
        isOpen: true,
        title: 'Success!',
        message: 'Your form has been saved successfully.',
        type: 'success',
        form: response.data 
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        title: 'Error Saving',
        message: 'We could not save your form. Please check your connection.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const activeField = fields.find(f => f.id === selectedField);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
      {/* Build Header */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="flex-1 flex items-center gap-4 bg-white p-2 pl-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`p-2.5 rounded-xl transition-all ${nameError ? 'bg-rose-500 text-white' : 'bg-brand-default text-white'}`}>
                <Layers size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <input 
                    type="text" 
                    placeholder="Enter Form Name..."
                    className={`bg-transparent border-none outline-none text-xl font-bold w-full placeholder:text-slate-300 ${nameError ? 'text-rose-500' : 'text-slate-800'}`}
                    value={formName}
                    onChange={(e) => {
                        setFormName(e.target.value);
                        if (nameError) setNameError(false);
                    }}
                />
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{previewMode ? 'Preview Mode' : 'Editor Mode'}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 pr-2">
                <button 
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${previewMode ? 'bg-brand-default text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    {previewMode ? <Code size={16} /> : <Eye size={16} />}
                    <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={loading || fields.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? <Clock className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>{loading ? 'Saving...' : 'Save Form'}</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar */}
        {!previewMode && (
          <aside className="w-80 flex flex-col gap-6 overflow-hidden">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button 
                    onClick={() => setActiveTab('components')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'components' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Plus size={14} />
                    <span>Add Fields</span>
                </button>
                <button 
                    onClick={() => setActiveTab('scheduling')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'scheduling' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Clock size={14} />
                    <span>Schedule</span>
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
                                    className="w-full group p-4 bg-white border border-slate-200 hover:border-brand-default rounded-2xl text-left transition-all hover:shadow-md flex items-start gap-4"
                                >
                                    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-default transition-all">
                                        <ft.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-xs font-bold text-slate-800">{ft.label}</span>
                                        <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{ft.description}</span>
                                    </div>
                                    <Plus size={14} className="text-slate-200 group-hover:text-brand-default mt-1" />
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200"
                        >
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Calendar size={14} className="text-brand-default" />
                                Availability
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Starts At</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none"
                                        value={startsAt}
                                        onChange={(e) => setStartsAt(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Ends At</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 outline-none"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </aside>
        )}

        {/* Work Area */}
        <main className={`flex-1 bg-white rounded-enterprise border border-slate-200 shadow-sm p-8 overflow-y-auto relative ${previewMode ? 'max-w-3xl mx-auto' : ''}`}>
            {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <MousePointer2 className="text-slate-300 mb-4" size={48} />
                    <p className="text-sm font-bold text-slate-400">Click a field on the left to start building your form.</p>
                </div>
            ) : (
                <div className="max-w-xl mx-auto py-4">
                  {!previewMode ? (
                    <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                      {fields.map((field, idx) => {
                        const Icon = FIELD_TYPES.find(t => t.type === field.type)?.icon;
                        return (
                          <Reorder.Item 
                            key={field.id} 
                            value={field}
                            className={`group bg-white rounded-2xl border-2 transition-all p-6 cursor-move ${
                              selectedField === field.id ? 'border-brand-default ring-4 ring-brand-500/5' : 'border-slate-50 hover:border-slate-200'
                            }`}
                            onClick={() => setSelectedField(field.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedField === field.id ? 'bg-brand-default text-white' : 'bg-slate-100 text-slate-400'}`}>
                                  {Icon && <Icon size={16} />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field {idx + 1}</span>
                                    {field.required && <span className="text-rose-500 text-sm">*</span>}
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-800">{field.label}</h4>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <GripVertical size={16} className="text-slate-300" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  ) : (
                    <div className="space-y-8">
                      <div className="border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-black text-slate-800">{formName || 'Untitled Form'}</h2>
                        <p className="text-slate-500 text-sm mt-1">Form Preview Mode</p>
                      </div>
                      <div className="space-y-6">
                        {fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                              {field.label}
                              {field.required && <span className="text-rose-500 ml-1">*</span>}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea className="input-field min-h-[100px]" placeholder={field.placeholder} disabled />
                            ) : field.type === 'dropdown' ? (
                              <select className="input-field bg-slate-50" disabled>
                                <option>{field.placeholder || 'Select an option'}</option>
                                {field.options.map(opt => <option key={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input 
                                type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'} 
                                className="input-field" 
                                placeholder={field.placeholder} 
                                disabled 
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-slate-100">
                        <button className="btn-primary w-full h-12" disabled>Submit Form</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
        </main>

        {/* Properties Inspector */}
        {!previewMode && (
          <aside className="w-80 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={16} className="text-brand-default" />
                        Field Settings
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeField ? (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Label</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 outline-none"
                                        value={activeField.label}
                                        onChange={(e) => updateField(activeField.id, { label: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Placeholder</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 outline-none"
                                        value={activeField.placeholder}
                                        onChange={(e) => updateField(activeField.id, { placeholder: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => updateField(activeField.id, { required: !activeField.required })}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                            >
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Required Field</span>
                                <div className={`w-10 h-5 rounded-full relative transition-all ${activeField.required ? 'bg-brand-default' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeField.required ? 'left-6' : 'left-1'}`} />
                                </div>
                            </button>

                            {(activeField.type === 'dropdown' || activeField.type === 'radio' || activeField.type === 'checkbox') && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choices</label>
                                        <button 
                                            onClick={() => updateField(activeField.id, { options: [...activeField.options, `Option ${activeField.options.length + 1}`] })}
                                            className="text-brand-default"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {activeField.options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-[11px] font-bold text-slate-600 outline-none"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...activeField.options];
                                                        newOpts[idx] = e.target.value;
                                                        updateField(activeField.id, { options: newOpts });
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const newOpts = activeField.options.filter((_, i) => i !== idx);
                                                        updateField(activeField.id, { options: newOpts });
                                                    }}
                                                    className="text-slate-300 hover:text-rose-500"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                            <Palette size={40} className="mb-4" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a field to edit its properties</p>
                        </div>
                    )}
                </div>
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        footer={
          <button 
            onClick={() => setModal({ ...modal, isOpen: false })}
            className="w-full btn-primary h-10 text-xs font-bold"
          >
            Close
          </button>
        }
      >
        <div className="flex items-start gap-5">
          <div className={`p-3 rounded-2xl ${modal.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {modal.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 mb-6">
              {modal.message}
            </p>
            {modal.type === 'success' && modal.form && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Share Link</p>
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value={`${window.location.origin}/f/${modal.form.slug}`}
                    className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-brand-default outline-none shadow-sm"
                  />
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/f/${modal.form.slug}`);
                        alert('Link copied to clipboard');
                    }}
                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormBuilder;
