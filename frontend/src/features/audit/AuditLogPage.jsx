import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Activity } from 'lucide-react';
import api from '../../lib/axios';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy nhật ký Audit Logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center gap-3">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Nhật Ký Thao Tác (Audit Log)</h1>
          <p className="text-sm text-slate-400">Theo dõi toàn bộ lịch sử thao tác người dùng & bảo mật hệ thống</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">
          Đang tải nhật ký thao tác hệ thống...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-300">Chưa có nhật ký nào được ghi nhận</h3>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Thời Gian</th>
                <th className="p-4">Người Thực Hiện</th>
                <th className="p-4">Hành Động (Action)</th>
                <th className="p-4">Tài Nguyên (Resource)</th>
                <th className="p-4">Địa Chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-4 text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-200 block">{log.user?.fullName || 'Hệ thống / Guest'}</span>
                    <span className="text-[10px] text-slate-400">{log.user?.email || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{log.resource}</td>
                  <td className="p-4 text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
