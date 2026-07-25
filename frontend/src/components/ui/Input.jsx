import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-900/80 border ${error ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
