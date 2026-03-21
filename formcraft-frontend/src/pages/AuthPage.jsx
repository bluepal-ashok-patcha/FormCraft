import { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  User,
  AlertCircle,
  Zap,
  Activity,
  Layers,
  Layout,
  Plus,
  MousePointer2,
  Send,
  Eye,
  Type,
  Square
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useAnimationFrame, animate } from 'framer-motion';

// ─── FORMCRAFT NODE ANIMATION (Custom "Blueprint" Style) ─────────────────────────
const FormNodeAnimation = ({ color = '#4f46e5' }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 400 });
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  }, [mouseX, mouseY]);

  // Mock Form Modules floating around
  const modules = [
    { id: 'M1', icon: Type, label: 'Text Input', x: 20, y: 25, delay: 0 },
    { id: 'M2', icon: Square, label: 'Checkbox', x: 75, y: 15, delay: 2 },
    { id: 'M3', icon: Mail, label: 'Email Field', x: 25, y: 50, delay: 1 },
    { id: 'M4', icon: Send, label: 'Submit Button', x: 25, y: 75, delay: 3 },
    { id: 'M5', icon: Shield, label: 'Validator', x: 80, y: 70, delay: 1.5 },
    { id: 'M6', icon: Zap, label: 'Logic Rule', x: 60, y: 35, delay: 2.5 },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto select-none"
    >
      {/* Background Grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.05" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Floating Connection Lines (Blueprint feel) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <motion.path
          d={`M ${size.w * 0.2} ${size.h * 0.25} L ${size.w * 0.38} ${size.h * 0.5} L ${size.w * 0.25} ${size.h * 0.75}`}
          stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="5,5"
        />
        <motion.path
          d={`M ${size.w * 0.75} ${size.h * 0.15} L ${size.w * 0.6} ${size.h * 0.35} L ${size.w * 0.8} ${size.h * 0.7}`}
          stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="5,5"
        />
      </svg>

      {modules.map((mod) => (
        <FormModule
          key={mod.id}
          {...mod}
          color={color}
          mouseX={mouseX}
          mouseY={mouseY}
          containerSize={size}
        />
      ))}

      {/* Central Branding Logo Area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 p-8 rounded-[3rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <Layers className="text-brand-default" size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tighter">FORMCRAFT</h1>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mt-1">Digital Architecture</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FormModule = ({ icon: Icon, label, x, y, delay, color, mouseX, mouseY, containerSize }) => {
  const posX = useMotionValue((x / 100) * containerSize.w);
  const posY = useMotionValue((y / 100) * containerSize.h);

  const offsetX = useSpring(0, { stiffness: 100, damping: 20 });
  const offsetY = useSpring(0, { stiffness: 100, damping: 20 });
  const hoverScale = useSpring(1, { stiffness: 200, damping: 15 });

  useEffect(() => {
    posX.set((x / 100) * containerSize.w);
    posY.set((y / 100) * containerSize.h);
  }, [containerSize, x, y]);

  useAnimationFrame(() => {
    const mX = mouseX.get();
    const mY = mouseY.get();
    const currX = posX.get();
    const currY = posY.get();

    const dx = mX - currX;
    const dy = mY - currY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const strength = 1 - dist / 150;
      offsetX.set(dx * strength * 0.4);
      offsetY.set(dy * strength * 0.4);
      hoverScale.set(1.1);
    } else {
      offsetX.set(0);
      offsetY.set(0);
      hoverScale.set(1);
    }
  });

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        x: offsetX,
        y: offsetY,
        scale: hoverScale,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        y: [0, -10, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="z-10 group"
    >
      <div className="bg-white/80 backdrop-blur-md border border-white p-3 rounded-2xl shadow-xl flex items-center gap-3 cursor-default">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
          <Icon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        <div className="pr-2">
          <p className="text-[10px] font-semibold text-slate-800 uppercase tracking-tight">{label}</p>
          <div className="flex gap-1 mt-0.5">
            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: [-50, 50] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full bg-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN AUTH PAGE ──────────────────────────────────────────────────────────────
const AuthPage = () => {
  const [view, setView] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'VERIFY_OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, verifyRegistration, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'LOGIN') {
        await login(formData.username, formData.password);
        toast.success('Login successful. Welcome!');
        navigate('/dashboard');
      } else if (view === 'REGISTER') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });
        toast.success('Registration successful. Please check your email for the OTP.');
        setView('VERIFY_OTP');
      } else if (view === 'VERIFY_OTP') {
        await verifyRegistration(formData.email, formData.otp);
        toast.success('Account verified successfully.');
        setView('LOGIN');
      } else if (view === 'FORGOT_PASSWORD') {
        await forgotPassword(formData.username); // using username field for email/username
        toast.success('We have sent a reset OTP to your email.');
        setView('RESET_PASSWORD');
      } else if (view === 'RESET_PASSWORD') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await resetPassword(formData.username, formData.otp, formData.password);
        toast.success('Password updated successfully.');
        setView('LOGIN');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Authentication failed.';
      setError(msg);
      toast.error(`Access Denied: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const isRegisterGroup = ['REGISTER', 'VERIFY_OTP'].includes(view);

  // Split-screen Panel Animation Variants (Desktop only)
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;

  const panelVariants = {
    login: { x: '0%', opacity: 1 },
    register: { x: isDesktop ? '-100%' : '0%', opacity: 1 }
  };

  const brandVariants = {
    login: { x: '0%', opacity: 1 },
    register: { x: isDesktop ? '100%' : '0%', opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans relative">
      
      {/* Branding Side (Sliding Overlay) */}
      <motion.div
        animate={isRegisterGroup ? 'register' : 'login'}
        variants={brandVariants}
        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1 }}
        className="hidden lg:flex absolute left-0 top-0 bottom-0 w-1/2 bg-brand-default z-20 flex-col items-center justify-center p-12 overflow-hidden"
      >
        <FormNodeAnimation color="#FFFFFF" />
      </motion.div>

      {/* Form Side (Sliding Panel) */}
      <motion.div
        animate={isRegisterGroup ? 'register' : 'login'}
        variants={panelVariants}
        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1 }}
        className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-16 z-10 overflow-y-auto no-scrollbar"
      >
        <div className="w-full max-w-[420px] py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'LOGIN' && (
                <>
                  <AuthHeader title="Welcome back" subtitle="Please sign in to manage your workspace" />
                  <ErrorMessage error={error} />
                  <form onSubmit={handleAction} className="space-y-5">
                    <InputField
                      label="Username or Email"
                      icon={User}
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <InputField
                      label="Password"
                      icon={Lock}
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      forgot={true}
                      onForgot={() => setView('FORGOT_PASSWORD')}
                    />
                    <SubmitButton loading={loading} text="Sign In" />
                  </form>
                  <AuthToggle
                    label="Don't have an account?"
                    action="Register Now"
                    onToggle={() => setView('REGISTER')}
                  />
                </>
              )}

              {view === 'REGISTER' && (
                <div className="max-w-[480px]">
                  <AuthHeader title="Create Account" subtitle="Join our community of developers" />
                  <ErrorMessage error={error} />
                  <form onSubmit={handleAction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Full Name"
                        icon={User}
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                      <InputField
                        label="Username"
                        icon={Zap}
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <InputField
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Password"
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <InputField
                        label="Confirm"
                        icon={Shield}
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <SubmitButton loading={loading} text="Create Account" />
                  </form>
                  <AuthToggle
                    label="Already have an account?"
                    action="Log In"
                    onToggle={() => setView('LOGIN')}
                  />
                </div>
              )}

              {view === 'VERIFY_OTP' && (
                <>
                  <AuthHeader title="Verify Account" subtitle={`Enter the OTP sent to ${formData.email}`} />
                  <ErrorMessage error={error} />
                  <form onSubmit={handleAction} className="space-y-6">
                    <InputField
                      label="Verification Code (6 Digits)"
                      icon={Lock}
                      placeholder="000000"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                    <SubmitButton loading={loading} text="Verify Account" />
                  </form>
                  <AuthToggle
                    label="Made a mistake?"
                    action="Back to Registration"
                    onToggle={() => setView('REGISTER')}
                  />
                </>
              )}

              {view === 'FORGOT_PASSWORD' && (
                <>
                  <AuthHeader title="Reset Password" subtitle="Enter your email to receive a reset OTP" />
                  <ErrorMessage error={error} />
                  <form onSubmit={handleAction} className="space-y-6">
                    <InputField
                      label="Username or Email"
                      icon={User}
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <SubmitButton loading={loading} text="Send OTP" />
                  </form>
                  <AuthToggle
                    label="Remembered your password?"
                    action="Back to Login"
                    onToggle={() => setView('LOGIN')}
                  />
                </>
              )}

              {view === 'RESET_PASSWORD' && (
                <>
                  <AuthHeader title="Update Password" subtitle="Enter the OTP and your new password" />
                  <ErrorMessage error={error} />
                  <form onSubmit={handleAction} className="space-y-4">
                    <InputField
                      label="OTP Code"
                      icon={Shield}
                      placeholder="000000"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="New Password"
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <InputField
                        label="Confirm Password"
                        icon={CheckCircle2}
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <SubmitButton loading={loading} text="Update Password" />
                  </form>
                  <AuthToggle
                    label="Cancel reset?"
                    action="Back to Login"
                    onToggle={() => setView('LOGIN')}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <footer className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none opacity-40">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} FormCraft Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────────

const AuthHeader = ({ title, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter mb-2">{title}</h2>
    <p className="text-slate-400 text-sm font-semibold tracking-tight">{subtitle}</p>
  </div>
);

const ErrorMessage = ({ error }) => (
  <AnimatePresence mode="wait">
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider border ${error.startsWith('success:')
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-red-50 border-red-100 text-red-700'
          }`}
      >
        {error.startsWith('success:') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        {error.replace('success:', '')}
      </motion.div>
    )}
  </AnimatePresence>
);

const InputField = ({ label, icon: Icon, type = 'text', placeholder, value, onChange, forgot, onForgot, required = true }) => (
  <div className="space-y-2 group">
    <div className="flex items-center justify-between px-1">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest group-focus-within:text-brand-600 transition-colors">
        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {forgot && (
        <button 
          type="button" 
          onClick={onForgot}
          className="text-[10px] font-semibold text-brand-600 hover:text-brand-500 transition-colors uppercase tracking-widest"
        >
          Forgot?
        </button>
      )}
    </div>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-300"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full h-14 bg-brand-default text-white rounded-2xl font-semibold text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-brand-600 transition-all active:scale-[0.98] shadow-xl shadow-brand-500/20 mt-8"
  >
    {loading ? (
      <Loader2 className="animate-spin" size={20} />
    ) : (
      <>
        <span>{text}</span>
        <ArrowRight size={18} />
      </>
    )}
  </button>
);

const AuthToggle = ({ onToggle, label, action }) => (
  <div className="mt-12 text-center">
    <button
      onClick={onToggle}
      className="group flex flex-col items-center gap-2 mx-auto"
    >
      <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em] group-hover:text-slate-400 transition-colors">
        {label}
      </span>
      <span className="text-xs font-semibold text-slate-900 uppercase tracking-widest border-b-2 border-transparent group-hover:border-slate-900 py-1 transition-all">
        {action}
      </span>
    </button>
  </div>
);

export default AuthPage;
