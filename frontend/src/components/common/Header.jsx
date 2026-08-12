import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Atom, User, LogOut, ShieldCheck, Sparkles, LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isRole = (role) => user?.role === role;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ETech Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Atom className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              ETech
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
              {isRole('ADMIN') ? 'ADMIN' : isRole('TEACHER') ? 'TEACHER' : 'MVP'}
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Bar per Role */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full transition-all ${
              isActive('/')
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}
          >
            Trang chủ
          </Link>

          {/* ADMIN Specific Links */}
          {isRole('ADMIN') && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin/dashboard')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Tổng quan
              </Link>
              <Link
                to="/admin/users"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin/users')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Người dùng
              </Link>
              <Link
                to="/admin/teachers"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin/teachers')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Giảng viên
              </Link>
              <Link
                to="/admin/subjects"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin/subjects')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Môn & Khối lớp
              </Link>
              <Link
                to="/admin/revenue"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/admin/revenue')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Doanh thu
              </Link>
              <Link
                to="/audit-logs"
                className={`px-3 py-1.5 rounded-full text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all`}
              >
                Audit Log
              </Link>
            </>
          )}

          {/* TEACHER Specific Links */}
          {isRole('TEACHER') && (
            <>
              <Link
                to="/questions"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/questions')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Ngân hàng câu hỏi
              </Link>
              <Link
                to="/manage-exams"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/manage-exams')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Đề thi
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/dashboard')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/reports"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/reports')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Báo cáo
              </Link>
              <Link
                to="/pricing"
                className={`px-3 py-1.5 rounded-full transition-all ${
                  isActive('/pricing')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Bảng giá
              </Link>
            </>
          )}

          {/* STUDENT / GUEST Links */}
          {(!user || isRole('STUDENT')) && (
            <>
              <Link
                to="/explore"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/explore')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Khám phá
              </Link>
              <Link
                to="/pricing"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/pricing')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Bảng giá
              </Link>
              <Link
                to="/live"
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  isActive('/live')
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                Live PIN
              </Link>
              <Link
                to="/leaderboard"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isActive('/leaderboard')
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                }`}
              >
                Bảng xếp hạng
              </Link>
            </>
          )}
        </nav>

        {/* User Actions & Plan Pill */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Workspace Switcher for TEACHER / ADMIN */}
              {(user.role === 'TEACHER' || user.role === 'ADMIN') && <WorkspaceSwitcher />}

              {/* Plan Upgrade Pill */}
              <Link
                to="/pricing"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  user.plan === 'PRO'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:scale-105'
                    : user.plan === 'ENTERPRISE'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:scale-105'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.plan || 'FREE'}</span>
                {user.plan !== 'PRO' && user.plan !== 'ENTERPRISE' && (
                  <span className="text-[10px] underline text-cyan-400 font-semibold ml-0.5">Nâng cấp</span>
                )}
              </Link>

              {/* User Profile Capsule Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-slate-200 max-w-[120px] truncate">{user.fullName}</span>
                <button onClick={onLogout} title="Đăng Xuất" className="text-slate-400 hover:text-rose-400 p-0.5">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Đăng Nhập
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')} className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0">
                Đăng Ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
