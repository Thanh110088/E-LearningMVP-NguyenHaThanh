import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-95",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95",
    outline: "bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200 active:scale-95",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300 active:scale-95",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
