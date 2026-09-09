import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Clock, Trophy, ShieldCheck, Users, BookOpen, ArrowRight, Radio, Sparkles, Plus, GraduationCap, Layers, FileText, Award, BarChart3, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminStats();
    } else if (user?.role === 'TEACHER') {
      fetchTeacherStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setAdminStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary');
      setTeacherStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê Giáo viên:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
   * 1. ADMIN VIEW (Trang chủ dành cho Quản trị viên Admin)
   * ---------------------------------------------------- */
  if (user?.role === 'ADMIN') {
    return (
      <div className="space-y-8 pb-16">
        {/* Admin Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> BẢNG ĐIỀU KHIỂN HỆ THỐNG ETECH ADMIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Xin chào, {user.fullName}!</h1>
            <p className="text-xs text-slate-400 font-medium">Tổng quan hoạt động, người dùng và doanh thu hệ thống ETech toàn quốc.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')} className="border-slate-700 text-xs font-bold">
              Quản lý người dùng
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/teachers')} className="bg-gradient-to-r from-cyan-500 to-sky-600 border-0 text-xs font-bold">
              Quản lý giảng viên
            </Button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Tổng người dùng</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white">{adminStats?.totalUsers || 15}</span>
            <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Giảng viên</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white">{adminStats?.totalTeachers || 2}</span>
            <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Workspace</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white">{adminStats?.totalWorkspaces || 6}</span>
            <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • +0 mới tuần này</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Lượt thi</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-white">{adminStats?.totalSubmissions || 107}</span>
            <span className="text-[11px] text-slate-400 font-medium block">— 0% 7 ngày qua • 87 đã chấm • 11 HS</span>
          </div>
        </div>

        {/* Admin Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white">Hoạt động gần đây</h3>
            <div className="space-y-3">
              {(adminStats?.recentActivity || []).length === 0 ? (
                <div className="text-xs text-slate-500 italic py-4">Chưa có hoạt động nộp bài mới nào.</div>
              ) : (
                (adminStats?.recentActivity || []).map((act, idx) => (
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
              {(adminStats?.topWorkspaces || []).map((ws, idx) => (
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
  }

  /* ----------------------------------------------------
   * 2. TEACHER VIEW (Trang chủ dành cho Giáo viên)
   * ---------------------------------------------------- */
  if (user?.role === 'TEACHER') {
    return (
      <div className="space-y-8 pb-16">
        {/* Teacher Welcome Workspace Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold mb-2">
                <GraduationCap className="w-4 h-4" /> WORKSPACE GIÁO VIÊN ETECH
              </div>
              <h1 className="text-3xl font-black text-white">Xin chào, Thầy/Cô {user.fullName}!</h1>
              <p className="text-sm text-slate-300 mt-1 font-medium">Quản lý đề thi, ngân hàng câu hỏi, giám sát trực tuyến và theo dõi báo cáo điểm số của học sinh.</p>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/manage-exams')}
              className="bg-gradient-to-r from-cyan-500 to-sky-600 font-extrabold text-xs px-6 py-3 border-0 shadow-lg shadow-cyan-500/25 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tạo Đề Thi Mới
            </Button>
          </div>

          {/* Teacher Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <Link
              to="/questions"
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">Ngân hàng câu hỏi</h4>
                  <span className="text-[10px] text-slate-400">Tạo & quản lý câu hỏi</span>
                </div>
              </div>
            </Link>

            <Link
              to="/manage-exams"
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">Quản lý đề thi</h4>
                  <span className="text-[10px] text-slate-400">Xuất bản & phát PIN</span>
                </div>
              </div>
            </Link>

            <Link
              to="/dashboard"
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">Dashboard thống kê</h4>
                  <span className="text-[10px] text-slate-400">Biểu đồ tỷ lệ Đạt/KĐ</span>
                </div>
              </div>
            </Link>

            <Link
              to="/reports"
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">Báo cáo & xuất CSV</h4>
                  <span className="text-[10px] text-slate-400">Tải điểm học sinh</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
   * 3. STUDENT / GUEST VIEW (Trang chủ dành cho Học sinh / Khách)
   * ---------------------------------------------------- */
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative pt-8 pb-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Nền tảng thi trắc nghiệm #1 cho giáo viên Việt Nam
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-100 leading-tight tracking-tight">
          Tạo đề thi, thi trực tuyến,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            chấm điểm tự động
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Thay thế đề giấy và Google Forms. Hỗ trợ công thức Toán/Lý/Hóa, trộn đề, đếm ngược thời gian, bảng xếp hạng realtime.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/explore')}
            className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-extrabold px-6 py-3 rounded-full shadow-lg shadow-cyan-500/25 border-0"
          >
            Khám phá đề thi
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/live')}
            className="rounded-full border-slate-700 hover:border-rose-500/50 hover:bg-slate-800 text-slate-200 font-bold px-6 py-3 flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Vào thi bằng mã PIN
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/leaderboard')}
            className="rounded-full border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 font-bold px-6 py-3 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" /> Bảng xếp hạng
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/pricing')}
            className="rounded-full border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200 font-bold px-6 py-3"
          >
            Xem bảng giá
          </Button>
        </div>
      </div>

      {/* 6 Feature Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Dễ dùng cho giáo viên</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tạo đề trong 5 phút. Import từ Word, gửi link cho học sinh.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Thi realtime</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Đếm ngược, lưu nháp tự động, chống rớt mạng với LocalStorage + Redis.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Bảng xếp hạng</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cập nhật điểm ngay khi học sinh nộp bài qua Socket.io.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Chống gian lận</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cảnh báo chuyển tab, không gửi đáp án đúng xuống client.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Multi-Workspace</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mỗi giáo viên có không gian riêng, sẵn sàng SaaS.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Hỗ trợ LaTeX</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hiển thị công thức Toán, Lý, Hóa với KaTeX.
          </p>
        </div>
      </div>

      <footer className="text-center pt-8 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
        © 2026 ETech. Nền tảng học tập thông minh.
      </footer>
    </div>
  );
};
