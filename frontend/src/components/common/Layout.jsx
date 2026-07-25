import React from 'react';
import { Header } from './Header';

export const Layout = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        © 2026 E-Learning & Quiz System MVP. Production-Ready Modular Architecture.
      </footer>
    </div>
  );
};
