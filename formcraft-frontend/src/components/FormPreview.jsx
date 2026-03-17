import React from 'react';

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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {field.label || `Field ${idx + 1}`}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Actual Input element per type */}
                  {field.type === 'TEXTAREA' ? (
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 resize-none"
                      rows={2}
                      placeholder={field.placeholder || 'Your answer'}
                      readOnly
                    />
                  ) : field.type === 'SELECT' ? (
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      disabled
                    >
                      <option>{field.placeholder || 'Choose an option'}</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'RADIO' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-slate-500">
                          <input type="radio" name={`field_${idx}`} className="accent-brand-default" readOnly />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'CHECKBOX' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-slate-500">
                          <input type="checkbox" className="accent-brand-default rounded" readOnly />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'DATE' ? (
                    <input
                      type="date"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      readOnly
                    />
                  ) : field.type === 'NUMBER' ? (
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50"
                      placeholder={field.placeholder || '0'}
                      readOnly
                    />
                  ) : (
                    <input
                      type={field.type === 'EMAIL' ? 'email' : 'text'}
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
