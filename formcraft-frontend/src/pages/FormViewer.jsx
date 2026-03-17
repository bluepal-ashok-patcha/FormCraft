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

const FormViewer = () => {
  const { slug } = useParams();
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
  const isUnavailable = !form || error || !isLive;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Initializing Secure Link...</p>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-enterprise shadow-2xl border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20 rotate-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">Transmission Complete</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          Your data has been successfully encrypted and synchronized with our enterprise repository.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full btn-primary py-4 rounded-2xl font-semibold"
        >
          New Submission
        </button>
      </motion.div>
    </div>
  );

  if (isUnavailable) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-enterprise shadow-2xl border border-slate-100 text-center"
      >
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transition-all duration-500 ${
          isPlanned ? 'bg-amber-500 shadow-amber-500/20' : 
          isInactive ? 'bg-rose-500 shadow-rose-500/20' : 
          'bg-rose-600 shadow-rose-600/20'
        } text-white`}>
          {isPlanned ? <Calendar size={40} /> : <AlertCircle size={40} />}
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-2 uppercase tracking-tight">
          {isPlanned ? 'Opening Soon' : 
           isInactive ? 'Form Closed' : 
           'Form Not Found'}
        </h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          {isPlanned ? `This form isn't open for responses yet. It will be available on ${new Date(form.startsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date(form.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}.` : 
           isInactive ? 'This form is currently not accepting responses.' : 
           error || "We couldn't find the form you're looking for or it may have been removed."}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-brand-default font-semibold uppercase tracking-widest text-[10px] hover:gap-3 transition-all">
          Go to Homepage <ArrowRight size={14} />
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-4 md:py-20 selection:bg-brand-default/20">
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
        {/* 🏢 CORPORATE EMBLEM */}
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl mb-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-brand-default/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <ShieldCheck className="text-white relative z-10" size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
               <span className="text-[10px] font-semibold uppercase text-brand-default tracking-[0.4em] block">Secure Intake Protocol</span>
               <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tighter uppercase">{form.name}</h1>
            </div>
            <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Connection: AES-256 Encrypted</span>
            </div>
        </div>

        {/* 📝 FORM ARCHITECTURE */}
        <div className="bg-white rounded-enterprise border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-50 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(Object.keys(responses).length / (form.schema?.fields?.length || 1)) * 100}%` }}
              className="absolute h-full bg-brand-default shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            <div className="space-y-10">
              {form.schema?.fields?.map((field) => (
                <div key={field.id} className="space-y-4 group">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-brand-default transition-colors">
                      {field.label}
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Field Type: {field.type}</span>
                  </div>
                  
                  <div className="relative">
                    {field.type === 'textarea' ? (
                      <textarea 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default focus:bg-white focus:shadow-xl focus:shadow-brand-default/5 transition-all min-h-[140px] placeholder:text-slate-300 placeholder:font-medium placeholder:italic"
                        placeholder={field.placeholder || "...Awaiting descriptive payload"}
                        required={field.required}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                      />
                    ) : field.type === 'dropdown' ? (
                      <div className="relative">
                        <select 
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default focus:bg-white transition-all appearance-none cursor-pointer pr-12"
                          required={field.required}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                        >
                          <option value="">Select registry option...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                    ) : field.type === 'date' ? (
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date"
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default focus:bg-white transition-all"
                          required={field.required}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                        />
                      </div>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-3">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-white hover:border-brand-default transition-all group/opt">
                            <input 
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={responses[field.label] === opt}
                              required={field.required && !responses[field.label]}
                              onChange={(e) => handleChange(field.label, e.target.value)}
                              className="w-4 h-4 text-brand-default focus:ring-brand-default border-slate-300"
                            />
                            <span className="text-sm font-semibold text-slate-700 group-hover/opt:text-brand-default transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-3">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-white hover:border-brand-default transition-all group/opt">
                            <input 
                              type="checkbox"
                              value={opt}
                              checked={(responses[field.label] || []).includes(opt)}
                              onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                              className="w-4 h-4 text-brand-default border-slate-300 rounded focus:ring-brand-default"
                            />
                            <span className="text-sm font-semibold text-slate-700 group-hover/opt:text-brand-default transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-default focus:bg-white focus:shadow-xl focus:shadow-brand-default/5 transition-all placeholder:text-slate-300 placeholder:font-medium"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col items-center gap-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl text-[13px] font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-default to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Execute Transmission</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-3">
                 <div className="w-10 h-[1px] bg-slate-200" />
                 <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">End of Protocol</span>
                 <div className="w-10 h-[1px] bg-slate-200" />
              </div>
            </div>
          </form>
        </div>

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
