import React from 'react';
import { motion } from 'framer-motion';

const FormPreview = ({ fields = [], name }) => {
  // Show max 4 fields to keep it clean
  const previewFields = fields.slice(0, 4);

  return (
    <div className="w-full h-full bg-white p-4 flex flex-col gap-3 overflow-hidden select-none pointer-events-none">
      {/* Form Title Header (Decorative) */}
      <div className="h-1.5 w-1/3 bg-slate-200 rounded-full mb-1" />
      
      <div className="space-y-4">
        {previewFields.map((field, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-1.5"
          >
            {/* Label Placeholder */}
            <div className="flex items-center justify-between">
              <div className="h-1 w-20 bg-slate-100 rounded-full" />
              {field.required && <div className="w-1 h-1 bg-brand-default rounded-full" />}
            </div>
            
            {/* Input Placeholder based on type */}
            <div className="w-full rounded-md border border-slate-50 bg-slate-50/30 h-6 flex items-center px-2">
              {field.type === 'SELECT' || field.type === 'RADIO' || field.type === 'CHECKBOX' ? (
                <div className="flex gap-1.5 w-full">
                  <div className="w-2 h-2 rounded-sm bg-slate-100" />
                  <div className="h-0.5 w-10 bg-slate-100/50 rounded-full mt-1" />
                </div>
              ) : field.type === 'TEXTAREA' ? (
                <div className="flex flex-col gap-1 w-full pt-1">
                  <div className="h-0.5 w-full bg-slate-100/50 rounded-full" />
                  <div className="h-0.5 w-2/3 bg-slate-100/50 rounded-full" />
                </div>
              ) : (
                <div className="h-0.5 w-1/2 bg-slate-100/50 rounded-full" />
              )}
            </div>
          </motion.div>
        ))}
        
        {/* If fewer than 4 fields, add a fake one */}
        {previewFields.length < 3 && (
           <div className="space-y-1.5 opacity-50">
             <div className="h-1 w-16 bg-slate-100 rounded-full" />
             <div className="w-full rounded-md border border-slate-50 bg-slate-100/20 h-6" />
           </div>
        )}
      </div>

      {/* Submit Button Placeholder */}
      <div className="mt-auto flex justify-end">
        <div className="w-12 h-4 bg-slate-900/5 rounded-md" />
      </div>
    </div>
  );
};

export default FormPreview;
