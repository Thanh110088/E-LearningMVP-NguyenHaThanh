import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border";

  const variants = {
    primary: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
