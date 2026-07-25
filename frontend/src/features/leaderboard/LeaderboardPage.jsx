import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Award } from 'lucide-react';
import api from '../../lib/axios';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy bảng xếp hạng:', err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-indigo-950/30 to-slate-900">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
          <Trophy className="w-4 h-4" /> Bảng Vàng Thành Tích
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Bảng Xếp Hạng Học Sinh Xấu Sắc</h1>
        <p className="text-sm text-slate-400">Vinh danh những thí sinh xuất sắc đạt điểm số cao nhất hệ thống</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium animate-pulse">
          Đang tổng hợp thứ hạng học sinh...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-300">Chưa có lượt thi nào hoàn thành</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-4">
              {/* Rank 2 */}
              {top3[1] && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 relative order-2 sm:order-1">
                  <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 font-black text-lg flex items-center justify-center mx-auto border border-slate-400/40">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-base">{top3[1].user?.fullName}</h3>
                    <p className="text-xs text-slate-400">{top3[1].exam?.title}</p>
                  </div>
                  <div className="text-xl font-extrabold text-indigo-400">{top3[1].score} điểm</div>
                </div>
              )}

              {/* Rank 1 */}
              {top3[0] && (
                <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 text-center space-y-4 relative order-1 sm:order-2 shadow-2xl shadow-amber-500/10">
                  <Crown className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 font-black text-2xl flex items-center justify-center mx-auto border-2 border-amber-400 shadow-lg shadow-amber-500/20">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-lg">{top3[0].user?.fullName}</h3>
                    <p className="text-xs text-indigo-300">{top3[0].exam?.title}</p>
                  </div>
                  <div className="text-2xl font-black text-amber-400">{top3[0].score} điểm</div>
                </div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 relative order-3">
                  <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-500 font-black text-lg flex items-center justify-center mx-auto border border-amber-700/40">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-base">{top3[2].user?.fullName}</h3>
                    <p className="text-xs text-slate-400">{top3[2].exam?.title}</p>
                  </div>
                  <div className="text-xl font-extrabold text-indigo-400">{top3[2].score} điểm</div>
                </div>
              )}
            </div>
          )}

          {/* Remaining Ranks Table */}
          {remaining.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 text-sm font-bold text-slate-300">
                Danh Sách Xếp Hạng Tiếp Theo
              </div>
              <div className="divide-y divide-slate-800/60">
                {remaining.map((item, idx) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 4}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{item.user?.fullName}</p>
                        <p className="text-xs text-slate-400">{item.exam?.title}</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-400">{item.score} điểm</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
