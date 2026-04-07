import { FileSpreadsheet, FileText, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 💎 ELITE EXPORT HUB
 * Professional Modal with Glassmorphism, Sticky Header/Footer, and Multi-Format Selection.
 */
const ExportModal = ({ isOpen, onClose, onExportCsv, onExportPdf, formName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        {/* Backdrop Logic */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px]"
          onClick={onClose}
        />

        {/* Modal Layer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-enterprise shadow-2xl overflow-hidden border border-white/50 flex flex-col max-h-[90vh]"
        >
          {/* 🏔 STICKY HEADER */}
          <div className="sticky top-0 z-10 px-8 py-5 bg-white/50 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-default rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <Download size={20} />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] leading-none">Export Hub</h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70 truncate max-w-[200px]">
                    {formName} <span className="mx-1">//</span> SELECT FORMAT
                  </p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* 🛋 SCROLLABLE BODY */}
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
             <p className="text-[11px] font-semibold text-slate-500 leading-relaxed uppercase tracking-wider">
               Select the orchestration level for your data synchronization. Professional PDFs include visual charts, while CSVs contain raw tabulated payloads.
             </p>

             <div className="grid grid-cols-1 gap-4">
                {/* 📊 PDF OPTION */}
                <button 
                  onClick={onExportPdf}
                  className="group relative flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-brand-default hover:shadow-xl hover:shadow-brand-500/5 transition-all text-left overflow-hidden active:scale-95"
                >
                   <div className="absolute top-0 right-0 w-16 h-16 bg-brand-default/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                   <div className="w-14 h-14 bg-brand-50 text-brand-default rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-default group-hover:text-white transition-all shadow-sm">
                      <FileText size={24} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Executive PDF Report</h4>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Analytics Charts + Distribution Table</p>
                   </div>
                </button>

                {/* 📄 CSV OPTION */}
                <button 
                  onClick={onExportCsv}
                  className="group relative flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-brand-default hover:shadow-xl hover:shadow-brand-500/5 transition-all text-left overflow-hidden active:scale-95"
                >
                   <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                   <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                      <FileSpreadsheet size={24} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Raw CSV Data</h4>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Spreadsheet compatible raw logs</p>
                   </div>
                </button>
             </div>
          </div>

          {/* ⚓ STICKY FOOTER */}
          <div className="sticky bottom-0 z-10 px-8 py-5 bg-slate-50/80 backdrop-blur-md border-t border-slate-200/50 flex items-center justify-end gap-3">
             <p className="text-[9px] font-bold text-slate-400 uppercase mr-auto tracking-widest opacity-60">
               Secured Data Protocol v2.4
             </p>
             <button 
               onClick={onClose}
               className="px-6 h-11 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
               CANCELLING SEQUENCE
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;
