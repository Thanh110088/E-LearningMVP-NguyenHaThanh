import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ReportsPage = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'elearning-submissions-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Không thể xuất file CSV báo cáo');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Báo Cáo & Xuất Dữ Liệu</h1>
            <p className="text-sm text-slate-400">Xem và trích xuất báo cáo kết quả lượt thi dạng CSV / Excel</p>
          </div>
        </div>

        <Button variant="primary" onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Xuất File CSV
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">
          Đang tải dữ liệu báo cáo...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">STT</th>
                <th className="p-4">Học Sinh</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tên Đề Thi</th>
                <th className="p-4">Mã Đề</th>
                <th className="p-4">Điểm Số</th>
                <th className="p-4">Kết Quả</th>
                <th className="p-4">Vi phạm (Chuyển tab)</th>
                <th className="p-4 text-right">Thời Gian Nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((sub, idx) => {
                const tabSwitchCount = sub.answersJson && typeof sub.answersJson === 'object' && !Array.isArray(sub.answersJson)
                  ? (sub.answersJson.tabSwitchCount || 0)
                  : 0;

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-4 font-semibold text-slate-200">{sub.user?.fullName}</td>
                    <td className="p-4 text-slate-400">{sub.user?.email}</td>
                    <td className="p-4 text-slate-300 font-medium">{sub.exam?.title}</td>
                    <td className="p-4 font-mono text-cyan-400 font-bold">{sub.exam?.code}</td>
                    <td className="p-4 font-bold text-amber-400">{sub.score} / {sub.exam?.totalPoints}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        sub.isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {sub.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="p-4">
                      {tabSwitchCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          ⚠️ Rời tab {tabSwitchCount} lần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ An toàn
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-slate-400">{new Date(sub.submittedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
