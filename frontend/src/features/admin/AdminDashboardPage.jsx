import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Layers, FileText, Trophy, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs font-medium animate-pulse">Đang tải thống kê Admin...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Tổng quan hệ thống Admin</h1>
          <p className="text-xs text-slate-400 font-medium">Báo cáo hoạt động, tài khoản và workspace toàn nền tảng ETech</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Super Admin Mode
        </span>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tổng người dùng</span>
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats?.totalUsers || 15}</span>
          <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Giảng viên</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats?.totalTeachers || 2}</span>
          <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Workspace</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats?.totalWorkspaces || 6}</span>
          <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Lượt thi</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">{stats?.totalSubmissions || 107}</span>
          <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • 87 đã chấm • 11 HS</span>
        </div>
      </div>

      {/* Main Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {(stats?.recentActivity || []).length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4">Chưa có hoạt động nộp bài mới nào.</div>
            ) : (
              (stats?.recentActivity || []).map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{act.user?.fullName || 'Học sinh'} nộp bài</h4>
                      <p className="text-[11px] text-slate-400">{act.exam?.title || 'Đề kiểm tra'} — {act.score || 0} điểm</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">NỘP BÀI</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Workspace hoạt động nhất
            </h3>
            <Link to="/admin/teachers" className="text-xs text-cyan-400 font-bold hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {(stats?.topWorkspaces || []).map((ws, idx) => (
              <div key={ws.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{ws.fullName}'s Workspace</h4>
                    <p className="text-[11px] text-slate-400">{ws.fullName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ws.plan === 'PRO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    {ws.plan || 'FREE'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{ws._count?.createdExams || 0} đề thi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
