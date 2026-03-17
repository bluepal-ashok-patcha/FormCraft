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
  ChevronDown
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
        setError(err?.message || "Critical link failure: Node unreachable.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/forms/submit', {
        formId: form.id,
        responses: responses
      });
      toast.success('Transmission Successful: Your response has been indexed.');
      setSubmitted(true);
    } catch (err) {
      toast.error('Protocol Error: Data transmission failed.');
      setError(err?.message || "Data transmission failed via protocol error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (label, option, checked) => {
    setResponses(prev => {
      const current = prev[label] || [];
      if (checked) {
        return { ...prev, [label]: [...current, option] };
      } else {
        return { ...prev, [label]: current.filter(item => item !== option) };
      }
    });
  };

  const handleChange = (label, value) => {
    setResponses(prev => ({ ...prev, [label]: value }));
  };

  const isLive = form?.status === 'ACTIVE';
  const isPlanned = form?.status === 'PLANNED';
  const isInactive = form?.status === 'INACTIVE';
  
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN');
  const isUnavailable = (!form || error || !isLive) && !isAdmin;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Initializing Secure Link...</p>
    </div>
  );

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
    <div className="min-h-screen bg-[#F0EBF8] flex flex-col items-center py-12 px-4 md:py-8 selection:bg-brand-default/20">
      {/* 🛸 DECORATIVE BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-default/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
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
          {!form?.bannerUrl && <div className="h-2.5 w-full bg-brand-default" />}
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
            <div key={field.id} className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
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
                        onChange={(e) => handleChange(field.label, e.target.value)}
                      />
                    ) : field.type === 'dropdown' ? (
                      <div className="relative">
                        <select 
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700 appearance-none cursor-pointer pr-12"
                          required={field.required}
                          onChange={(e) => handleChange(field.label, e.target.value)}
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
                          onChange={(e) => handleChange(field.label, e.target.value)}
                        />
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
                                checked={responses[field.label] === opt}
                                required={field.required && !responses[field.label]}
                                onChange={(e) => handleChange(field.label, e.target.value)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-brand-default transition-all"
                              />
                              <div className="absolute h-2.5 w-2.5 rounded-full bg-brand-default opacity-0 peer-checked:opacity-100 transition-opacity" />
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
                                checked={(responses[field.label] || []).includes(opt)}
                                onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brand-default checked:bg-brand-default transition-all"
                              />
                              <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={14} strokeWidth={4} />
                            </div>
                            <span className="text-sm font-normal text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        className="w-full bg-transparent border-b-2 border-slate-200 outline-none focus:border-brand-default transition-all py-3 px-1 text-sm font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                        />
                    )}
                  </div>
                </div>
              ))}

          <div className="flex justify-between items-center flex-row-reverse px-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-10 bg-brand-default hover:bg-brand-600 text-white rounded font-medium text-sm transition-all active:scale-[0.98] shadow-sm flex items-center gap-2"
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
