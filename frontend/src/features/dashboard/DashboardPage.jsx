import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, HelpCircle, Users, CheckCircle2, Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../lib/axios';

export const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-medium animate-pulse">
        Đang tải báo cáo tổng quan Dashboard...
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng Đề Thi', value: stats?.totalExams || 0, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Tổng Câu Hỏi', value: stats?.totalQuestions || 0, icon: HelpCircle, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Tổng Học Sinh', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Lượt Thi Hoàn Thành', value: stats?.totalSubmissions || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Báo Cáo Thống Kê (Analytics Dashboard)</h1>
          <p className="text-sm text-slate-400">Tổng quan chỉ số hoạt động hệ thống E-Learning & Thi trực tuyến</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-100 mt-1">{card.value}</h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} border border-slate-800`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Rate Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Tỷ Lệ Đạt/Không Đạt ({stats?.passRate || 0}%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.chartData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Lượt Bài Thi Gần Đây
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Học Sinh</th>
                  <th className="p-3">Đề Thi</th>
                  <th className="p-3">Điểm Số</th>
                  <th className="p-3">Kết Quả</th>
                  <th className="p-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats?.recentSubmissions?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">{sub.user?.fullName}</td>
                    <td className="p-3 text-slate-300">{sub.exam?.title}</td>
                    <td className="p-3 font-bold text-indigo-400">{sub.score} điểm</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {sub.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(sub.submittedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
