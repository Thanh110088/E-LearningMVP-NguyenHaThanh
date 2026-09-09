import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Monitor, Users, CheckCircle2, Clock3,
  ShieldAlert, RefreshCw, Wifi, Activity,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { socket } from '../../services/socket';
import api from '../../lib/axios';

const STATUS_LABELS = {
  IN_PROGRESS: { label: 'Đang thi', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  COMPLETED: { label: 'Đã nộp', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  EXPIRED: { label: 'Hết giờ', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

export const ExamMonitorPage = ({ examId, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const fetchLive = useCallback(async () => {
    try {
      const [resLive, resExam] = await Promise.all([
        api.get(`/submissions/exam/${examId}/live`),
        api.get(`/exams/${examId}`),
      ]);
      const subList = Array.isArray(resLive)
        ? resLive
        : Array.isArray(resLive?.data)
          ? resLive.data
          : Array.isArray(resLive?.data?.data)
            ? resLive.data.data
            : [];
      setSubmissions(subList);

      const examData = resExam?.data?.id ? resExam.data : resExam?.id ? resExam : (resExam?.data || null);
      setExamInfo(examData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Monitor fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => { fetchLive(); }, [fetchLive]);

  // ── Real-Time Socket.IO Listener ──
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleRealtimeUpdate = () => {
      // Instant refresh on any student action
      fetchLive();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(`exam:monitor:${examId}`, handleRealtimeUpdate);
    socket.on('exam:monitor', handleRealtimeUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(`exam:monitor:${examId}`, handleRealtimeUpdate);
      socket.off('exam:monitor', handleRealtimeUpdate);
    };
  }, [examId, fetchLive]);

  // ── Fast Polling every 3s as backup ──
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, [fetchLive, autoRefresh]);

  const inProgress = submissions.filter(s => s.status === 'IN_PROGRESS');
  const completed = submissions.filter(s => s.status === 'COMPLETED');
  const totalViolations = submissions.reduce((sum, s) => sum + (s.violationCount || 0), 0);
  const totalQuestions = examInfo?._count?.questions || examInfo?.questions?.length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Giám Sát Phòng Thi Trực Tuyến
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE REALTIME
              </span>
            </h1>
            {examInfo && <p className="text-sm text-slate-400">{examInfo.title} • Mã: {examInfo.code}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isConnected ? 'WebSocket: Đã kết nối' : 'Đang đồng bộ (3s)'}</span>
          </div>
          <button
            onClick={() => setAutoRefresh(p => !p)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${autoRefresh ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            {autoRefresh ? 'Auto 3s: BẬT' : 'Tắt'}
          </button>
          <Button variant="outline" onClick={fetchLive} className="flex items-center gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng thí sinh', value: submissions.length, icon: <Users className="w-5 h-5" />, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Đang làm bài', value: inProgress.length, icon: <Clock3 className="w-5 h-5" />, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
          { label: 'Đã nộp bài', value: completed.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Tổng vi phạm', value: totalViolations, icon: <ShieldAlert className="w-5 h-5" />, color: `${totalViolations > 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-slate-400 bg-slate-800 border-slate-700'}` },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3 ${color}`}>
            <div className={`p-2 rounded-xl border ${color}`}>{icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-100">{value}</p>
              <p className="text-xs font-medium text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Last refresh */}
      <p className="text-xs text-slate-500 text-right">
        Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
      </p>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Đang kết nối phòng thi...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Chưa có thí sinh nào bắt đầu thi</h3>
          <p className="text-xs text-slate-500">Màn hình sẽ tự động hiển thị thí sinh ngay khi có người bấm "Bắt Đầu Làm Bài".</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm">Danh Sách Thí Sinh Trong Phòng</h3>
            <span className="text-xs text-slate-400">{submissions.length} thí sinh</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  {['Họ tên', 'Email', 'Trạng thái', 'Tiến độ làm bài', 'Điểm', 'Bắt đầu lúc', 'Vi phạm quy chế'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => {
                  const st = STATUS_LABELS[s.status] || STATUS_LABELS.IN_PROGRESS;
                  const answered = s.answeredCount || 0;
                  const progressPct = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

                  return (
                    <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                            {s.user?.fullName ? s.user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{s.user?.fullName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{s.user?.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">{answered} {totalQuestions > 0 ? `/ ${totalQuestions} câu` : 'câu'}</span>
                            {totalQuestions > 0 && <span className="text-slate-400">{progressPct}%</span>}
                          </div>
                          {totalQuestions > 0 && (
                            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.status === 'COMPLETED' ? (
                          <span className={`font-black text-base ${s.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {s.score}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Đang thi...</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        {new Date(s.startedAt).toLocaleTimeString('vi-VN')}
                      </td>
                      <td className="px-4 py-3.5">
                        {(s.violationCount || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-xs animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            {s.violationCount} vi phạm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            ✓ Nghiêm túc
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
