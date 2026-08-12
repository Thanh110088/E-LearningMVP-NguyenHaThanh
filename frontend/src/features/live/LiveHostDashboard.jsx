import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Trophy,
  Users,
  Play,
  Square,
  QrCode,
  Copy,
  Check,
  Zap,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { socket } from "../../services/socket";

export const LiveHostDashboard = ({ examId, onBack }) => {
  const [pinCode, setPinCode] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [status, setStatus] = useState("LOBBY"); // LOBBY, IN_PROGRESS, FINISHED
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const [customHost, setCustomHost] = useState("");
  const currentOrigin = customHost
    ? `${window.location.protocol}//${customHost}`
    : window.location.origin;
  const joinUrl = `${currentOrigin}/live?pin=${pinCode}`;

  useEffect(() => {
    socket.connect();

    socket.emit("host:create_room", { examId });

    socket.on("host:room_created", (data) => {
      setPinCode(data.pinCode);
      setExamTitle(data.examTitle);
      setTotalQuestions(data.totalQuestions);
      setStatus(data.status);
      if (data.players) setPlayers(data.players);
    });

    socket.on("room:players_updated", (data) => {
      setPlayers(data.players || []);
    });

    socket.on("room:leaderboard_updated", (data) => {
      setLeaderboard(data.leaderboard || []);
    });

    socket.on("quiz:started", () => {
      setStatus("IN_PROGRESS");
    });

    socket.on("quiz:ended", (data) => {
      setStatus("FINISHED");
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });

    socket.on("host:error", (err) => {
      alert(err.message || "Lỗi hệ thống phòng live");
    });

    return () => {
      socket.off("host:room_created");
      socket.off("room:players_updated");
      socket.off("room:leaderboard_updated");
      socket.off("quiz:started");
      socket.off("quiz:ended");
      socket.off("host:error");
      socket.disconnect();
    };
  }, [examId]);

  const handleStartQuiz = () => {
    if (players.length === 0) {
      if (!window.confirm("Chưa có học sinh nào vào phòng. Bạn có chắc muốn bắt đầu không?")) {
        return;
      }
    }
    socket.emit("host:start_quiz", { pinCode });
  };

  const handleResetRoom = () => {
    if (window.confirm("Bạn có chắc chắn muốn reset phòng để tổ chức lượt thi mới không?")) {
      socket.emit("host:reset_room", { pinCode });
    }
  };

  const handleEndQuiz = () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc buổi thi trực tiếp không?")) {
      socket.emit("host:end_quiz", { pinCode });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              ← Bảng điều khiển
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> Quizizz Live Engine
            </div>
            <h1 className="text-2xl font-black text-slate-100">{examTitle || "Đang tải đề thi..."}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Tổng số {totalQuestions} câu hỏi • Chế độ thi trực tiếp độc lập
            </p>
          </div>
        </div>

        {/* PIN Code Box */}
        <div className="flex items-center gap-6 bg-slate-950/80 border border-indigo-500/40 rounded-xl px-6 py-3">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mã PIN Tham Gia</div>
            <div className="text-3xl font-black text-indigo-400 tracking-widest font-mono">
              {pinCode || "______"}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Đã copy link" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* LOBBY STATE */}
        {status === "LOBBY" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left QR & PIN Screen */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <h2 className="text-xl font-bold text-slate-200 mb-2">Quét mã QR để gia nhập</h2>
              <p className="text-sm text-slate-400 mb-6">Mở camera điện thoại hoặc quét bằng Zalo/Trình duyệt</p>

              <div className="p-6 bg-white rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition duration-300 border-4 border-indigo-500/40">
                {pinCode ? (
                  <QRCodeSVG value={joinUrl} size={220} level="H" />
                ) : (
                  <div className="w-[220px] h-[220px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                    Đang tạo QR...
                  </div>
                )}
              </div>

              <div className="w-full text-slate-300 text-xs font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="truncate">
                  URL QR: <span className="text-indigo-400 font-mono font-bold">{joinUrl}</span>
                </div>
                {window.location.hostname === "localhost" && (
                  <div className="pt-2 border-t border-slate-800 text-left">
                    <label className="block text-[11px] text-amber-400 font-semibold mb-1">
                      💡 Quét bằng ĐT cùng Wi-Fi? Nhập IP máy tính (VD: 192.168.1.5:5173):
                    </label>
                    <input
                      type="text"
                      placeholder="192.168.x.x:5173"
                      value={customHost}
                      onChange={(e) => setCustomHost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Waiting Players Screen */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">Đã vào phòng chờ</h2>
                      <p className="text-xs text-slate-400">Danh sách học sinh sẽ xuất hiện ngay khi quét QR</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                    {players.length} Học Sinh
                  </span>
                </div>

                {/* Players Grid */}
                <div className="min-h-[260px] max-h-[360px] overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-500/50 mb-3" />
                      <p className="text-sm font-medium">Đang chờ học sinh quét mã QR hoặc nhập PIN...</p>
                    </div>
                  ) : (
                    players.map((p, idx) => (
                      <div
                        key={p.socketId || idx}
                        className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl animate-fade-in hover:border-indigo-500/40 transition"
                      >
                        <img
                          src={
                            p.avatarUrl ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName)}`
                          }
                          alt={p.playerName}
                          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <span className="text-sm font-bold text-slate-200 truncate">{p.playerName}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition transform active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" /> Bắt Đầu Bài Thi Trực Tiếp
              </button>
            </div>
          </div>
        )}

        {/* IN_PROGRESS REALTIME LEADERBOARD STATE */}
        {status === "IN_PROGRESS" && (
          <div className="space-y-6">
            {/* Top Stats & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  ĐANG THI LIVE (REALTIME LEADERBOARD)
                </div>
                <div className="text-xs text-slate-400">
                  Tổng người làm: <span className="text-slate-100 font-bold">{leaderboard.length}</span>
                </div>
              </div>
              <button
                onClick={handleEndQuiz}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
              >
                <Square className="w-4 h-4 fill-current" /> Kết Thúc & Vinh Danh
              </button>
            </div>

            {/* Leaderboard Table (Quizizz Style Animated Rows) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" /> Bảng Xếp Hạng Điểm Số Trực Tiếp
                </h2>
                <span className="text-xs text-slate-400">Điểm số tự động nhảy khi học sinh gửi câu trả lời</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">Chưa có dữ liệu làm bài...</div>
                ) : (
                  leaderboard.map((item, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    let rankBg = "bg-slate-950/80 border-slate-800";
                    let rankBadge = <span className="font-bold text-slate-400 font-mono">#{index + 1}</span>;

                    if (isTop1) {
                      rankBg = "bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-500/5";
                      rankBadge = (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center shadow-md">
                          🥇
                        </div>
                      );
                    } else if (isTop2) {
                      rankBg = "bg-slate-300/10 border-slate-400/40 text-slate-200";
                      rankBadge = (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black flex items-center justify-center shadow-md">
                          🥈
                        </div>
                      );
                    } else if (isTop3) {
                      rankBg = "bg-amber-700/10 border-amber-700/40 text-amber-300";
                      rankBadge = (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                          🥉
                        </div>
                      );
                    }

                    const progressPercent = Math.min(
                      100,
                      Math.round(((item.totalAnswered || 0) / totalQuestions) * 100)
                    );

                    return (
                      <div
                        key={item.socketId || index}
                        className={`flex items-center justify-between p-4 border rounded-2xl transition duration-300 transform hover:-translate-y-0.5 ${rankBg}`}
                      >
                        {/* Left: Rank & Avatar & Name */}
                        <div className="flex items-center gap-4 min-w-[220px]">
                          <div className="w-8 flex items-center justify-center">{rankBadge}</div>
                          <img
                            src={
                              item.avatarUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.playerName)}`
                            }
                            alt={item.playerName}
                            className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <div className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                              {item.playerName}
                              {item.streak > 1 && (
                                <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                  <Flame className="w-3 h-3 text-amber-400 mr-0.5" /> {item.streak}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Đúng: <span className="text-emerald-400 font-bold">{item.correctAnswers}</span> /{" "}
                              {totalQuestions} câu
                            </div>
                          </div>
                        </div>

                        {/* Middle: Progress Bar */}
                        <div className="hidden md:block flex-1 max-w-xs mx-6">
                          <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                            <span>Tiến độ</span>
                            <span>
                              {item.totalAnswered}/{totalQuestions} câu
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Right: Score */}
                        <div className="text-right">
                          <div className="text-2xl font-black text-indigo-400 font-mono tracking-tight">
                            {(item.score || 0).toLocaleString()} <span className="text-xs text-indigo-300">đ</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* FINISHED PODIUM STATE */}
        {status === "FINISHED" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" /> Bục Vinh Danh Cuối Cùng
            </div>
            <h2 className="text-3xl font-black text-slate-100 mb-8">Kết Quả Bài Thi Live</h2>

            {/* Podium Display (Top 3) */}
            <div className="flex items-end justify-center gap-4 sm:gap-8 mb-12 max-w-3xl mx-auto pt-8">
              {/* 2nd Place */}
              {leaderboard[1] ? (
                <div className="flex flex-col items-center flex-1 max-w-[180px]">
                  <img
                    src={leaderboard[1].avatarUrl}
                    alt={leaderboard[1].playerName}
                    className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-xl mb-2"
                  />
                  <span className="font-bold text-slate-200 text-sm truncate max-w-full">
                    {leaderboard[1].playerName}
                  </span>
                  <span className="text-xs text-indigo-400 font-mono font-extrabold mb-2">
                    {leaderboard[1].score.toLocaleString()} đ
                  </span>
                  <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl h-36 flex items-center justify-center text-slate-950 font-black text-2xl shadow-2xl">
                    🥈
                  </div>
                </div>
              ) : (
                <div className="flex-1 max-w-[180px] h-36 border border-dashed border-slate-800 rounded-t-2xl"></div>
              )}

              {/* 1st Place (Center Big) */}
              {leaderboard[0] ? (
                <div className="flex flex-col items-center flex-1 max-w-[200px] transform -translate-y-4">
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-amber-400 absolute -top-4 -right-2 animate-bounce" />
                    <img
                      src={leaderboard[0].avatarUrl}
                      alt={leaderboard[0].playerName}
                      className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-2xl mb-2"
                    />
                  </div>
                  <span className="font-black text-amber-300 text-base truncate max-w-full">
                    {leaderboard[0].playerName}
                  </span>
                  <span className="text-sm text-amber-400 font-mono font-extrabold mb-2">
                    {leaderboard[0].score.toLocaleString()} đ
                  </span>
                  <div className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 rounded-t-2xl h-48 flex items-center justify-center text-slate-950 font-black text-4xl shadow-2xl">
                    🥇
                  </div>
                </div>
              ) : null}

              {/* 3rd Place */}
              {leaderboard[2] ? (
                <div className="flex flex-col items-center flex-1 max-w-[180px]">
                  <img
                    src={leaderboard[2].avatarUrl}
                    alt={leaderboard[2].playerName}
                    className="w-16 h-16 rounded-full border-4 border-amber-700 shadow-xl mb-2"
                  />
                  <span className="font-bold text-slate-200 text-sm truncate max-w-full">
                    {leaderboard[2].playerName}
                  </span>
                  <span className="text-xs text-indigo-400 font-mono font-extrabold mb-2">
                    {leaderboard[2].score.toLocaleString()} đ
                  </span>
                  <div className="w-full bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-2xl h-28 flex items-center justify-center text-slate-950 font-black text-2xl shadow-2xl">
                    🥉
                  </div>
                </div>
              ) : (
                <div className="flex-1 max-w-[180px] h-28 border border-dashed border-slate-800 rounded-t-2xl"></div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleResetRoom}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Tổ Chức Lượt Thi Mới
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border border-slate-700 transition"
              >
                Về Quản Lý Đề Thi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
