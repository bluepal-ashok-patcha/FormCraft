import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl p-1 rounded-enterprise shadow-2xl border border-white/10">
          <div className="bg-white rounded-enterprise p-10 shadow-inner">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-enterprise flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20 rotate-3">
                <Square className="text-white fill-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
              <p className="text-slate-500 font-medium">Enterprise Intelligence Platform</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex gap-3 items-center"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-300 font-medium"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">Master Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-300 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 ml-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-5 h-5 bg-slate-100 border border-slate-200 rounded flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Keep me signed in</span>
                </label>
                <a href="#" className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">Forgot Key?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-enterprise font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:bg-black shadow-xl shadow-slate-900/20 group h-14"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium mb-3">New to the cluster?</p>
              <Link to="/register" className="text-slate-900 font-semibold hover:text-black transition-colors flex items-center justify-center gap-2">
                Provision New Access
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 font-medium tracking-wide border-t border-white/5 pt-8">
          <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
            <Shield size={16} />
            <span className="text-xs uppercase font-semibold">Encrypted Endpoints</span>
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <p className="text-[10px] uppercase font-semibold tracking-[0.2em]">v2.4.0 Core-Pulse</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
