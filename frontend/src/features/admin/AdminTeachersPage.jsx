import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import api from '../../lib/axios';

export const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách giảng viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (teacherId, newPlan) => {
    try {
      await api.put(`/admin/teachers/${teacherId}/plan`, { plan: newPlan });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi gói dịch vụ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-1">
        <h1 className="text-2xl font-black text-white">Quản lý giảng viên ETech</h1>
        <p className="text-xs text-slate-400 font-medium">Gói dịch vụ theo tài khoản giáo viên (áp dụng cho mọi workspace).</p>
      </div>

      {/* Main Table Card */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-200">{teachers.length} giáo viên trong hệ thống</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Tên</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Workspace</th>
                <th className="pb-3">Gói dịch vụ</th>
                <th className="pb-3">Đề / Câu</th>
                <th className="pb-3 text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 animate-pulse">Đang tải danh sách giảng viên...</td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Chưa có giảng viên nào.</td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-100">{t.fullName}</td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">{t.email}</td>
                    <td className="py-3.5 text-slate-300 font-bold">1</td>
                    <td className="py-3.5">
                      <select
                        value={t.plan || 'FREE'}
                        onChange={(e) => handlePlanChange(t.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold border focus:outline-none bg-slate-900 ${
                          t.plan === 'PRO'
                            ? 'text-amber-300 border-amber-500/40'
                            : t.plan === 'ENTERPRISE'
                            ? 'text-cyan-300 border-cyan-500/40'
                            : 'text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="FREE">Free</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </td>
                    <td className="py-3.5 font-bold text-slate-200">{t._count?.createdExams || 0} / 60</td>
                    <td className="py-3.5 text-right text-slate-400 text-[11px]">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
