import React from 'react';
import { Star } from 'lucide-react';

const FormPreview = ({ fields = [], name, bannerUrl, thumbnailUrl }) => {
  const displayUrl = bannerUrl || thumbnailUrl;
  const previewFields = fields.slice(0, 5);

  return (
    <div className="w-full h-full overflow-hidden relative bg-slate-50 select-none pointer-events-none">
      {/* Scale the real form down to fit the card thumbnail — like Google Forms/Sheets */}
      <div
        style={{
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          width: '222%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Google Forms style top brand accent bar */}
        <div className="h-3 w-full bg-brand-default" />

        <div className="bg-slate-50 min-h-full">
          {/* Banner image (like Google Forms cover photo) */}
          {displayUrl && (
            <div className="w-full h-40 overflow-hidden">
              <img
                src={displayUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4">
            {/* Title card */}
            <div
              className={`bg-white rounded-xl border border-slate-200 px-5 py-4 mb-3 shadow-sm ${
                displayUrl ? 'border-t-4 border-t-brand-default' : 'border-l-4 border-l-brand-default'
              }`}
            >
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{name || 'Form Preview'}</h2>
              <p className="text-xs text-slate-400 mt-1">Fill out this form</p>
            </div>

            {/* Real form fields */}
            <div className="space-y-3">
              {previewFields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm"
                >
                  {/* Label */}
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    {field.label || `Field ${idx + 1}`}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Actual Input element per type */}
                  {field.type?.toUpperCase() === 'TEXTAREA' ? (
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 resize-none"
                      rows={2}
                      placeholder={field.placeholder || 'Your answer'}
                      readOnly
                    />
                  ) : field.type?.toUpperCase() === 'SELECT' || field.type?.toUpperCase() === 'DROPDOWN' ? (
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      disabled
                    >
                      <option>{field.placeholder || 'Choose an option'}</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type?.toUpperCase() === 'RADIO' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-slate-500">
                          <input type="radio" name={`field_${idx}`} className="accent-brand-default" readOnly />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type?.toUpperCase() === 'CHECKBOX' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-slate-500">
                          <input type="checkbox" className="accent-brand-default rounded" readOnly />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type?.toUpperCase() === 'DATE' ? (
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      readOnly
                    />
                  ) : field.type?.toUpperCase() === 'NUMBER' ? (
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      placeholder={field.placeholder || '0'}
                      readOnly
                    />
                  ) : field.type?.toUpperCase() === 'RATING' ? (
                    <div className="flex items-center gap-1.5 py-1">
                      {[...Array(field.max || 5)].map((_, i) => (
                        <Star key={i} size={18} className="text-slate-200 fill-slate-50" />
                      ))}
                    </div>
                  ) : field.type?.toUpperCase() === 'LINEAR-SCALE' ? (
                    <div className="flex items-center justify-center gap-6 py-2">
                      <span className="text-[10px] text-slate-800 mt-4 font-normal min-w-[50px] text-right truncate">{field.minLabel || ''}</span>
                      <div className="flex items-center gap-4">
                        {Array.from({ length: (field.max || 5) - (field.min || 0) + 1 }, (_, i) => (field.min || 0) + i).map((val) => (
                          <div key={val} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-normal">{val}</span>
                            <div className="w-4 h-4 rounded-full border border-slate-200 bg-white" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-800 mt-4 font-normal min-w-[50px] text-left truncate">{field.maxLabel || ''}</span>
                    </div>
                  ) : (
                    <input
                      type={field.type?.toUpperCase() === 'EMAIL' ? 'email' : 'text'}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      placeholder={field.placeholder || 'Your answer'}
                      readOnly
                    />
                  )}
                </div>
              ))}

              {previewFields.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm">
                  <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded-lg" />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                className="px-6 py-2 bg-brand-default text-white text-sm font-semibold rounded-lg opacity-80"
                disabled
              >
                Submit
              </button>
              <button className="px-4 py-2 text-brand-default text-sm font-medium opacity-60" disabled>
                Clear form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
