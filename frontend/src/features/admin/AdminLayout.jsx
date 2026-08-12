import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign, Settings, Atom, LogOut, ShieldCheck } from 'lucide-react';

export const AdminLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Người dùng', icon: Users },
    { path: '/admin/teachers', label: 'Giảng viên', icon: GraduationCap },
    { path: '/admin/subjects', label: 'Môn học', icon: BookOpen },
    { path: '/admin/revenue', label: 'Doanh thu', icon: DollarSign },
    { path: '/admin/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sky-50/40 text-slate-800 flex font-sans">
      {/* LEFT SIDEBAR (Khớp 5 Hình Ảnh ETech Admin) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-6">
          {/* Admin Brand Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">ETech Admin</h2>
              <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest block">SUPER ADMIN</span>
            </div>
          </Link>

          {/* Navigation Menu List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-200/60'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info (Khớp Hình 1, 2, 3, 4, 5) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>🎥 Đang xem: Admin</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName ? user.fullName.charAt(0) : 'A'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{user?.fullName || 'Super Admin'}</span>
                <span className="text-[10px] text-slate-400 font-semibold">Super Admin</span>
              </div>
            </div>

            <button onClick={onLogout} title="Đăng xuất" className="text-slate-400 hover:text-rose-500 p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
