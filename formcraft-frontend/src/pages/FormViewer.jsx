import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  ChevronDown,
  Star,
  Upload,
  Paperclip,
  FileIcon,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FormViewer = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState({ fieldId: null, value: 0 });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [uploadingFields, setUploadingFields] = useState({}); // { fieldLabel: true/false }

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`[Viewer] Initiating bridge to node: ${slug}`);
        const response = await api.get(`/forms/s/${slug}`);
        console.log("[Viewer] Received payload:", response.data);
        setForm(response.data);
      } catch (err) {
        console.error("[Viewer] Connection failed:", err);
        setError(err?.response?.data?.message || err?.message || "This form is currently unavailable. Please check the link or contact the owner.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  useEffect(() => {
    if (form && form.schema?.fields) {
      const initialResponses = {};
      form.schema.fields.forEach(field => {
        if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
          // Special handling for numeric types
          if (field.type === 'number') {
            initialResponses[field.label] = parseFloat(field.defaultValue);
          } else {
            initialResponses[field.label] = field.defaultValue;
          }
        }
      });
      setResponses(initialResponses);
    }
  }, [form]);

  const validateField = (field, value) => {
    const validation = field.validation || {};
    const isRequired = field.required;
    const label = field.label;

    // 1. Required Check
    if (isRequired && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === ''))) {
        return `${label} is required.`;
    }

    // 2. Type/Advanced Rules (only if value exists)
    if (value && value.toString().trim() !== '') {
        const valStr = value.toString();
        
        // Email Pattern
        if (field.type === 'email' && !/^[A-Za-z0-9+_.-]+@(.+)$/.test(valStr)) {
            return validation.errorMessage || `Please enter a valid email address.`;
        }

        // Numeric Range
        if (field.type === 'number') {
            const num = parseFloat(valStr);
            if (validation.min !== undefined && num < validation.min) {
                return validation.errorMessage || `This value must be at least ${validation.min}.`;
            }
            if (validation.max !== undefined && num > validation.max) {
                return validation.errorMessage || `This value cannot exceed ${validation.max}.`;
            }
        }

        // String Length
        if (['text', 'textarea', 'email'].includes(field.type)) {
            if (validation.minLength !== undefined && valStr.length < validation.minLength) {
                return validation.errorMessage || `Please enter at least ${validation.minLength} characters.`;
            }
            if (validation.maxLength !== undefined && valStr.length > validation.maxLength) {
                return validation.errorMessage || `Please enter no more than ${validation.maxLength} characters.`;
            }
        }

        // Custom Regex
        if (validation.regex) {
            try {
                const re = new RegExp(validation.regex);
                if (!re.test(valStr)) {
                    return validation.errorMessage || `The format entered is not valid.`;
                }
            } catch (e) {
                console.error("Advanced Regex Logic Failure:", e);
            }
        }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Deep Validation Protocol
    const newErrors = {};
    const fields = form.schema?.fields || [];
    let firstErrorField = null;

    fields.forEach(field => {
        const errorMsg = validateField(field, responses[field.id]);
        if (errorMsg) {
            newErrors[field.id] = errorMsg;
            if (!firstErrorField) firstErrorField = field.id;
        }
    });

    if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        toast.error('Please complete all required fields correctly.');
        setSubmitting(false);
        // Scroll to first error for convenience
        const element = document.getElementById(`field-${firstErrorField}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    try {
      await api.post('/forms/submit', {
        formId: form.id,
        responses: responses
      });
      toast.success('Submitted successfully. Thank you!');
      setSubmitted(true);
    } catch (err) {
      toast.error('Unable to send your response. Please try again.');
      setError(err?.message || "There was a problem sending your data. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (field, option, checked) => {
    setResponses(prev => {
      const current = prev[field.id] || [];
      const newValue = checked ? [...current, option] : current.filter(item => item !== option);
      
      // Inline Validation (only if touched or previously errored)
      if (touched[field.id] || Object.keys(formErrors).length > 0) {
        const errorMsg = validateField(field, newValue);
        setFormErrors(prevErrors => ({ ...prevErrors, [field.id]: errorMsg }));
      }
      
      return { ...prev, [field.id]: newValue };
    });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field.id]: true }));
    const errorMsg = validateField(field, responses[field.id]);
    setFormErrors(prev => ({ ...prev, [field.id]: errorMsg }));
  };

  const handleChange = (field, value) => {
    setResponses(prev => ({ ...prev, [field.id]: value }));
    
    // Inline Validation (only if touched or previously errored)
    if (touched[field.id] || Object.keys(formErrors).length > 0) {
      const errorMsg = validateField(field, value);
      setFormErrors(prev => ({ ...prev, [field.id]: errorMsg }));
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    setUploadingFields(prev => ({ ...prev, [field.id]: true }));
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/forms/upload-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const url = response.url || response.data?.url;
      if (url) {
        handleChange(field, url);
        toast.success(`File uploaded successfully.`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(`The file upload failed. Please try again.`);
    } finally {
      setUploadingFields(prev => ({ ...prev, [field.id]: false }));
    }
  };

  const isLive = form?.status === 'ACTIVE';
  const isPlanned = form?.status === 'PLANNED';
  const isInactive = form?.status === 'INACTIVE';
  
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN');
  const isUnavailable = (!form || error || !isLive) && !isAdmin;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Loading Form...</p>
    </div>
  );

  // If form is null after loading, or critical error occurred
  if (!form || error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
           <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-slate-900 mb-2">Form Not Found</h2>
           <p className="text-slate-500 text-sm mb-6">{error || "The form you are looking for does not exist or is no longer available."}</p>
           <Link to="/" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900">Return Home</Link>
        </div>
      </div>
    );
  }

  if (submitted) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 text-center"
      >
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">Thank You!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Your response has been successfully submitted and recorded.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
        >
          Submit Another Response
        </button>
      </motion.div>
    </div>
  );

  if (isUnavailable) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 text-center"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md transition-all duration-500 ${
          isPlanned ? 'bg-amber-500 shadow-amber-500/10' : 
          'bg-red-600 shadow-red-500/10'
        } text-white`}>
          {isPlanned ? <Calendar size={28} /> : <AlertCircle size={28} />}
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {isPlanned ? 'Starting Soon' : 
           isInactive ? 'Form Closed' : 
           'Not Found'}
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {isPlanned ? `This form is scheduled to open on ${new Date(form.startsAt).toLocaleDateString()}.` : 
           isInactive ? 'This form is no longer accepting responses.' : 
           'The form you are looking for does not exist.'}
        </p>
        <Link to="/" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          Return Home
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-12 px-4 md:py-8 selection:bg-brand-default/20 transition-colors duration-1000"
      style={{ backgroundColor: form?.schema?.backgroundColor || (form?.themeColor ? `${form.themeColor}10` : '#F8FAFC') }}
    >
      {/* 🛸 DECORATIVE BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000" 
          style={{ backgroundColor: `${form?.themeColor || '#6366f1'}1a` }} // ~10% opacity
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] blur-[100px] rounded-full transition-colors duration-1000" 
          style={{ backgroundColor: `${form?.themeColor || '#6366f1'}0d` }} // ~5% opacity
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        {form?.bannerUrl && (
          <div className="w-full h-40 md:h-48 rounded-t-xl overflow-hidden border-x border-t border-slate-200 shadow-sm relative group">
             <img 
               src={form.bannerUrl} 
               alt="Banner" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        )}

        {/* Header Card */}
        <div className={`bg-white shadow-sm border border-slate-200 overflow-hidden mb-4 relative ${form?.bannerUrl ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>
          <div className="h-2.5 w-full" style={{ backgroundColor: form?.themeColor || '#6366f1' }} />
          <div className="p-8">
            <h1 className="text-3xl font-normal text-slate-900 mb-2">{form.name}</h1>
            <p className="text-sm text-slate-600 font-normal">Official Form Portal</p>
            
            {isAdmin && !isLive && (
              <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-fit">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Preview Mode</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {form.schema?.fields?.map((field) => (
            <div id={`field-${field.id}`} key={field.id} className={`bg-white p-6 md:p-8 rounded-xl border transition-all duration-300 shadow-sm space-y-6 ${formErrors[field.id] ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-200'}`}>
              <div className="space-y-2">
                <label className="text-base font-normal text-slate-900 flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
              </div>
                  
                  <div className="relative">
                    {field.type === 'textarea' ? (
                      <textarea 
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700 min-h-[50px] resize-none placeholder:text-slate-300 placeholder:font-normal"
                        placeholder={field.placeholder || "Please provide details..."}
                        required={field.required}
                        value={responses[field.id] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                      />
                    ) : field.type === 'dropdown' ? (
                      <div className="relative">
                        <select 
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700 appearance-none cursor-pointer pr-12"
                          required={field.required}
                          value={responses[field.id] || ''}
                          onChange={(e) => handleChange(field, e.target.value)}
                          onBlur={() => handleBlur(field)}
                        >
                          <option value="">Please select an option...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                    ) : field.type === 'date' ? (
                      <div className="relative">
                        <input 
                          type="date"
                          className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700"
                          required={field.required}
                          value={responses[field.id] || ''}
                          onChange={(e) => handleChange(field, e.target.value)}
                          onBlur={() => handleBlur(field)}
                        />
                      </div>
                    ) : field.type === 'number' ? (
                      <input 
                        type="number"
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                        placeholder={field.placeholder || "0"}
                        value={responses[field.id] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                      />
                    ) : field.type === 'rating' ? (
                      <div className="flex items-center gap-4">
                        {[...Array(field.max || 5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleChange(field, i + 1)}
                            onMouseEnter={() => setHoverRating({ fieldId: field.id, value: i + 1 })}
                            onMouseLeave={() => setHoverRating({ fieldId: null, value: 0 })}
                            className="transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star 
                              size={36} 
                              className={`transition-all duration-300 ${
                                (hoverRating.fieldId === field.id ? hoverRating.value : (responses[field.id] || 0)) > i 
                                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" 
                                  : "text-slate-200"
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    ) : field.type === 'linear-scale' ? (
                      <div className="flex items-center justify-center gap-8 py-6 px-4">
                        <span className="text-sm text-slate-800 mt-6 font-normal min-w-[80px] text-right">{field.minLabel || ''}</span>
                        <div className="flex items-center gap-6">
                          {Array.from({ length: (field.max || 5) - (field.min || 0) + 1 }, (_, i) => (field.min || 0) + i).map((val) => {
                             const isSelected = responses[field.id] === val;
                             return (
                              <div key={val} className="flex flex-col items-center gap-3">
                                  <span className="text-sm text-slate-600 font-normal">{val}</span>
                                  <div 
                                    onClick={() => handleChange(field, val)}
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200`}
                                    style={isSelected ? { borderColor: form?.themeColor || '#6366f1', backgroundColor: `${form?.themeColor || '#6366f1'}1a` } : { borderColor: '#cbd5e1' }}
                                  >
                                      {isSelected && <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: form?.themeColor || '#6366f1' }} />}
                                  </div>
                              </div>
                             );
                          })}
                        </div>
                        <span className="text-sm text-slate-800 mt-6 font-normal min-w-[80px] text-left">{field.maxLabel || ''}</span>
                      </div>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-4">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group/opt">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={responses[field.id] === opt}
                                required={field.required && !responses[field.id]}
                                onChange={(e) => handleChange(field, e.target.value)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 transition-all"
                                style={responses[field.id] === opt ? { borderColor: form?.themeColor || '#6366f1' } : {}}
                              />
                              <div className="absolute h-2.5 w-2.5 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" style={{ backgroundColor: form?.themeColor || '#6366f1' }} />
                            </div>
                            <span className="text-sm font-normal text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-4">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group/opt">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox"
                                value={opt}
                                checked={(responses[field.id] || []).includes(opt)}
                                onChange={(e) => handleCheckboxChange(field, opt, e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 transition-all rounded"
                                style={(responses[field.id] || []).includes(opt) ? { borderColor: form?.themeColor || '#6366f1', backgroundColor: form?.themeColor || '#6366f1' } : {}}
                              />
                              <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={14} strokeWidth={4} />
                            </div>
                            <span className="text-sm font-normal text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="space-y-4">
                        <div className={`relative group transition-all duration-300 ${uploadingFields[field.id] ? 'opacity-70 pointer-events-none' : ''}`}>
                          {responses[field.id] ? (
                            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                               <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-md">
                                  <Paperclip size={18} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest truncate">File Ready</p>
                                  <a href={responses[field.id]} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline truncate block">View Attachment</a>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => handleChange(field, '')}
                                 className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                               >
                                  <X size={16} />
                               </button>
                            </div>
                          ) : (
                            <label className={`flex flex-col items-center justify-center gap-3 py-8 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                              formErrors[field.id] ? 'bg-red-50/30 border-red-200' : 'bg-slate-50 border-slate-200 hover:border-brand-default hover:bg-white active:scale-[0.99]'
                            }`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${uploadingFields[field.id] ? 'bg-brand-50' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-default'}`}>
                                {uploadingFields[field.id] ? (
                                  <Loader2 className="animate-spin text-brand-default" size={24} />
                                ) : (
                                  <Upload size={24} />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{uploadingFields[field.id] ? 'Uploading...' : 'Upload File'}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Select or drag & drop</p>
                              </div>
                              <input 
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(field, e.target.files[0])}
                                disabled={uploadingFields[field.id]}
                              />
                            </label>
                          )}
                        </div>
                        {uploadingFields[field.id] && (
                           <div className="flex items-center gap-3 px-2">
                             <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: '0%' }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="h-full bg-brand-default"
                                />
                             </div>
                             <span className="text-[9px] font-bold text-brand-default uppercase tracking-widest">Uploading...</span>
                           </div>
                        )}
                      </div>
                    ) : (
                      <input 
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none transition-all py-3 px-1 text-sm font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                        style={{ borderBottomColor: touched[field.id] ? (form?.themeColor || '#6366f1') : '' }}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        value={responses[field.id] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                      />
                    )}
                  </div>

                  {/* Field Error Display */}
                  <AnimatePresence>
                    {formErrors[field.id] && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 overflow-hidden"
                        >
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest leading-none">
                                {formErrors[field.id]}
                            </p>
                        </motion.div>
                    )}
                  </AnimatePresence>
            </div>
              ))}

          <div className="flex justify-between items-center flex-row-reverse px-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-10 text-white rounded font-medium text-sm transition-all active:scale-[0.98] shadow-sm flex items-center gap-2 hover:opacity-90 shadow-lg"
              style={{ backgroundColor: form?.themeColor || '#6366f1', boxShadow: `0 4px 14px 0 ${form?.themeColor || '#6366f1' }40` }}
            >
              {submitting ? <Loader2 className="animate-spin text-white" size={16} /> : 'Submit'}
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>FormCraft Protected</span>
            </div>
          </div>
        </form>

        {/* 🔒 SECURITY FOOTER */}
        <footer className="mt-16 flex flex-col items-center text-center opacity-60">
           <div className="flex items-center gap-6 mb-8">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/ISO_logo_ISO_9001_certified.svg/1024px-ISO_logo_ISO_9001_certified.svg.png" alt="ISO" className="h-8 grayscale brightness-150" />
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col items-start">
                 <span className="text-[9px] font-semibold text-slate-900 uppercase">System Integrity</span>
                 <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-tighter">Verified Node // 2026</span>
              </div>
           </div>
           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] border-t border-slate-200 pt-8 w-full max-w-xs">
              Powered by <span className="text-slate-900">FormCraft Intel</span>
           </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default FormViewer;
