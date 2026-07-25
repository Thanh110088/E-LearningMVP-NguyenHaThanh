import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, ShieldCheck, GraduationCap } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              EduQuiz <span className="text-indigo-400 font-medium text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">MVP</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Hệ Thống Thi Trực Tuyến</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Khám Phá Đề Thi</Link>
          <Link to="/categories" className="hover:text-indigo-400 transition-colors">Môn Học & Khối Lớp</Link>
          {user?.role === 'ADMIN' && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </span>
          )}
        </nav>

        {/* User Info / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">{user.fullName}</span>
                <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-rose-400">
                <LogOut className="w-4 h-4 mr-1.5" /> Đăng Xuất
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Đăng Nhập
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Đăng Ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
