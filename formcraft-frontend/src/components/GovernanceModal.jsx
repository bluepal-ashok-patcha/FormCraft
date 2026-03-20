import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

const GovernanceModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Please confirm that you want to proceed with this action.",
  confirmText = "Continue",
  cancelText = "Cancel",
  type = "warning" // 'warning', 'danger', 'info'
}) => {
  const themes = {
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      icon: <AlertTriangle size={24} className="text-amber-500" />,
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-sm rounded-md'
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      icon: <Trash2 size={24} className="text-red-500" />,
      btn: 'bg-red-600 hover:bg-red-700 shadow-sm rounded-md'
    },
    info: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      border: 'border-brand-100',
      icon: <ShieldAlert size={24} className="text-brand-default" />,
      btn: 'bg-brand-default hover:bg-brand-600 shadow-sm rounded-md'
    }
  };

  const theme = themes[type] || themes.info;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md w-full h-full"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[6px] shadow-lg overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[4px] ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                  {theme.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">
                    {title}
                  </h3>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest opacity-70">
                    Security Verification // Action Required
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-10">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md text-[10px] font-semibold uppercase tracking-widest transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-8 py-3 rounded-md text-white text-[10px] font-semibold uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 group ${theme.btn}`}
              >
                {confirmText}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GovernanceModal;
