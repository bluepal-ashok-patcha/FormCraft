import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Square, 
  Loader2, 
  UserPlus, 
  Ghost, 
  Layout, 
  CheckCircle,
  Hash,
  Type,
  User,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingField = ({ delay, icon: Icon, top, left, rotate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotateZ: rotate }}
    animate={{ 
      opacity: [0.05, 0.15, 0.05], 
      y: [0, -40, 0],
      rotateZ: [rotate, rotate + 10, rotate]
    }}
    transition={{ 
      duration: 8, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute pointer-events-none hidden lg:block text-brand-default blur-[0.5px]"
    style={{ top, left }}
  >
    <Icon size={40} strokeWidth={1.5} />
  </motion.div>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    fullName: '',
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        navigate('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });
        setIsLogin(true);
        alert('Provisioning successful. Access granted.');
      }
    } catch (err) {
      setError(err?.message || 'Interface error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex items-center justify-center p-6 relative overflow-hidden perspective-1000">
      {/* Dynamic Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-50 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-50 blur-[100px] rounded-full opacity-80" />
        
        {/* Floating System Assets */}
        <FloatingField icon={Layout} top="15%" left="12%" rotate={-10} delay={0} />
        <FloatingField icon={Type} top="60%" left="8%" rotate={15} delay={1} />
        <FloatingField icon={CheckCircle} top="25%" left="82%" rotate={5} delay={2} />
        <FloatingField icon={Hash} top="70%" left="88%" rotate={-15} delay={1.5} />
      </div>

      <motion.div 
        layout
        className="w-full max-w-[1100px] flex gap-20 items-center relative z-10"
      >
        {/* Left Side: Professional Branding */}
        <div className="hidden lg:flex flex-col flex-1 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center shadow-xl shadow-slate-200">
              <Square className="text-white fill-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic">FormCraft</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-bold text-slate-900 leading-[1.1] mb-6">
              Next-generation <br />
              <span className="text-brand-default">data architecture.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              The industry standard for building, deploying, and monitoring dynamic collection nodes in real-time.
            </p>
            
            <div className="flex items-center gap-12 border-t border-slate-100 pt-8">
              <div>
                <p className="text-2xl font-bold text-slate-900">4.9k+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Deployments</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div>
                <p className="text-2xl font-bold text-slate-900">99.9%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Uptime</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: 3D Auth Card */}
        <div className="w-full max-w-[420px] preserve-3d">
          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login' : 'register'}
              initial={{ rotateY: 90, opacity: 0, scale: 0.95 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -90, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="bg-white p-1 rounded-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-200"
            >
              <div className="p-10">
                <div className="mb-10 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">
                    {isLogin ? 'Access your administrative console' : 'Initialize your collection workspace'}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[11px] font-bold flex items-center gap-3">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleAction} className="space-y-4">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="label-sm">Full Name</label>
                      <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-default transition-colors" size={16} />
                        <input
                          type="text"
                          required
                          className="input-field pl-11 text-sm font-medium"
                          placeholder="e.g. John Doe"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <label className="label-sm">Username</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-default transition-colors" size={16} />
                      <input
                        type="text"
                        required
                        className="input-field pl-11 text-sm font-medium"
                        placeholder="e.g. j.doe_architect"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="label-sm">System Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-default transition-colors" size={16} />
                        <input
                          type="email"
                          required
                          className="input-field pl-11 text-sm font-medium"
                          placeholder="admin@enterprise.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <label className="label-sm">Access Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-default transition-colors" size={16} />
                      <input
                        type="password"
                        required
                        className="input-field pl-11 text-sm font-medium"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="label-sm">Verify Key</label>
                      <div className="relative group">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-default transition-colors" size={16} />
                        <input
                          type="password"
                          required
                          className="input-field pl-11 text-sm font-medium"
                          placeholder="Confirm access key"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary h-12 mt-4 text-sm tracking-wide"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>{isLogin ? 'Authenticate' : 'Initialize Node'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    {isLogin ? "New to the architecture?" : "Existing administrator?"}
                  </p>
                  <button
                    onClick={handleToggle}
                    className="text-sm font-bold text-brand-default hover:text-brand-600 transition-colors flex items-center gap-2"
                  >
                    {isLogin ? 'Create Workspace' : 'Sign in to Interface'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};


export default AuthPage;
