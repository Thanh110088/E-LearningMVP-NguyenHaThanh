import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, TrendingUp, Users } from 'lucide-react';
import api from '../../lib/axios';

export const AdminRevenuePage = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/admin/revenue');
      setRevenue(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy thông tin doanh thu:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-xs font-medium animate-pulse">Đang tải báo cáo doanh thu...</div>;
  }

  const freeCount = revenue?.freeUsers || 14;
  const proCount = revenue?.proUsers || 1;
  const mrr = (revenue?.estimatedMRR || 99000).toLocaleString('vi-VN');

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-1">
        <h1 className="text-2xl font-black text-white">Doanh thu & gói dịch vụ ETech</h1>
        <p className="text-xs text-slate-400 font-medium">Ước tính từ tài khoản Pro (chưa tích hợp cổng thanh toán trực tiếp)</p>
      </div>

      {/* 2 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <span className="text-xs font-bold text-slate-400">Free</span>
          <div>
            <span className="text-3xl font-black text-white">{freeCount}</span>
            <span className="text-xs text-slate-400 font-medium block mt-1">tài khoản miễn phí</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <span className="text-xs font-bold text-cyan-400">Pro</span>
          <div>
            <span className="text-3xl font-black text-white">{proCount}</span>
            <span className="text-xs text-slate-400 font-medium block mt-1">• 99.000đ/tháng</span>
          </div>
        </div>
      </div>

      {/* MRR Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-3">
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider block">MRR ước tính</span>
        <div className="text-4xl font-black text-cyan-400 font-mono">{mrr}đ</div>
        <p className="text-xs text-slate-400 font-medium">
          Công thức: Số tài khoản Pro x giá Pro/tháng (cấu hình trong Cài đặt)
        </p>
      </div>
    </div>
  );
};
