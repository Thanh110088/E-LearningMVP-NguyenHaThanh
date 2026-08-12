import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Radio,
  KeyRound,
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Flame,
  User,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { socket } from "../../services/socket";

export const LiveRoomPage = ({ user }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Step state: PIN_ENTRY, LOBBY, IN_QUIZ, QUESTION_FEEDBACK, FINISHED
  const [step, setStep] = useState("PIN_ENTRY");
  const [pinCode, setPinCode] = useState(searchParams.get("pin") || "");
  const [playerName, setPlayerName] = useState(user?.fullName || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live session state
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Score & Feedback state
  const [playerStats, setPlayerStats] = useState({
    score: 0,
    correctAnswers: 0,
    streak: 0,
  });
  const [feedback, setFeedback] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const urlPin = searchParams.get("pin");
    if (urlPin) {
      setPinCode(urlPin.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    socket.on("player:join_success", (data) => {
      setExamTitle(data.examTitle);
      setQuestions(data.questions || []);
      setPlayerStats({
        score: data.player.score || 0,
        correctAnswers: data.player.correctAnswers || 0,
        streak: 0,
      });

      if (data.status === "IN_PROGRESS") {
        setStep("IN_QUIZ");
        setQuestionStartTime(Date.now());
      } else {
        setStep("LOBBY");
      }
      setLoading(false);
    });

    socket.on("player:join_error", (err) => {
      setError(err.message || "Không thể gia nhập phòng thi");
      setLoading(false);
    });

    socket.on("quiz:started", (data) => {
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setStep("IN_QUIZ");
      setQuestionStartTime(Date.now());
    });

    socket.on("player:answer_feedback", (data) => {
      setFeedback(data);
      setPlayerStats({
        score: data.totalScore,
        correctAnswers: data.isCorrect ? playerStats.correctAnswers + 1 : playerStats.correctAnswers,
        streak: data.streak,
      });

      // Show feedback for 1.8s then auto advance to next question
      setTimeout(() => {
        setFeedback(null);
        setSelectedOptionId(null);
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          setStep("FINISHED");
        }
      }, 1800);
    });

    socket.on("room:leaderboard_updated", (data) => {
      setLeaderboard(data.leaderboard || []);
    });

    socket.on("quiz:ended", (data) => {
      setStep("FINISHED");
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });

    socket.on("quiz:reset", (data) => {
      setStep("PIN_ENTRY");
      if (data.newPin) setPinCode(data.newPin);
      setError("Giáo viên đã reset phòng để tổ chức lượt thi mới. Hãy tham gia lại nhé!");
    });

    return () => {
      socket.off("player:join_success");
      socket.off("player:join_error");
      socket.off("quiz:started");
      socket.off("player:answer_feedback");
      socket.off("room:leaderboard_updated");
      socket.off("quiz:ended");
    };
  }, [currentQuestionIndex, questions.length, playerStats.correctAnswers]);

  const handleJoin = (e) => {
    e.preventDefault();
    setError("");

    if (!pinCode.trim()) {
      setError("Vui lòng nhập mã PIN");
      return;
    }

    const nameToUse = playerName.trim() || user?.fullName || `Học sinh #${Math.floor(1000 + Math.random() * 9000)}`;

    setLoading(true);
    socket.connect();
    socket.emit("player:join_room", {
      pinCode: pinCode.trim(),
      userId: user?.id || null,
      playerName: nameToUse,
      avatarUrl: user?.avatarUrl,
    });
  };

  const handleSelectOption = (optionId) => {
    if (selectedOptionId || feedback) return;

    setSelectedOptionId(optionId);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const currentQ = questions[currentQuestionIndex];

    socket.emit("player:submit_answer", {
      pinCode: pinCode.trim(),
      questionId: currentQ.id,
      selectedOptionId: optionId,
      timeSpentSeconds,
    });
  };

  // Color options array for Kahoot/Quizizz aesthetic buttons
  const optionColors = [
    { bg: "bg-rose-600 hover:bg-rose-500", border: "border-rose-500", shadow: "shadow-rose-600/30", label: "A" },
    { bg: "bg-blue-600 hover:bg-blue-500", border: "border-blue-500", shadow: "shadow-blue-600/30", label: "B" },
    { bg: "bg-amber-600 hover:bg-amber-500", border: "border-amber-500", shadow: "shadow-amber-600/30", label: "C" },
    { bg: "bg-emerald-600 hover:bg-emerald-500", border: "border-emerald-500", shadow: "shadow-emerald-600/30", label: "D" },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      {/* 1. PIN ENTRY STEP */}
      {step === "PIN_ENTRY" && (
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 animate-pulse">
              <Radio className="w-4 h-4" /> Live Room PIN Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">Tham Gia Thi Live</h1>
            <p className="text-sm text-slate-400">
              Quét mã QR hoặc nhập mã PIN 6 số để vào bài thi trực tiếp
            </p>
          </div>

          <form onSubmit={handleJoin} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase text-center">
                Mã PIN Phòng Thi
              </label>
              <div className="relative">
                <KeyRound className="w-6 h-6 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={10}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                  placeholder="VD: 123456"
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-3.5 pl-14 pr-4 text-center font-mono text-2xl font-black tracking-widest text-indigo-400 uppercase focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase text-center">
                Tên Của Bạn
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập biệt danh thi đấu..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              size="lg"
              loading={loading}
              className="w-full text-base font-extrabold py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30"
            >
              Vào Phòng Thi Live <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>
      )}

      {/* 2. LOBBY STEP */}
      {step === "LOBBY" && (
        <div className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center animate-bounce">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider">
              PIN: {pinCode}
            </span>
            <h2 className="text-2xl font-black text-slate-100 mt-1">{examTitle}</h2>
            <p className="text-sm text-slate-400 mt-2">
              Xin chào <span className="text-indigo-300 font-bold">{playerName}</span>! Bạn đã gia nhập thành công.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-300 text-sm font-medium animate-pulse">
            ⏳ Đang chờ giáo viên nhấn "Bắt đầu bài thi"...
            <br />
            <span className="text-xs text-slate-400">Hãy chú ý lên màn hình chiếu của giáo viên!</span>
          </div>
        </div>
      )}

      {/* 3. IN_QUIZ STEP */}
      {step === "IN_QUIZ" && questions[currentQuestionIndex] && (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-black">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>
              {playerStats.streak > 1 && (
                <span className="flex items-center gap-1 text-amber-400 text-xs font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  <Flame className="w-4 h-4 fill-current" /> Chuỗi x{playerStats.streak}
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Điểm của bạn</div>
              <div className="text-lg font-black text-indigo-400 font-mono">
                {playerStats.score.toLocaleString()} đ
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-extrabold text-slate-100 leading-relaxed mb-6">
              {questions[currentQuestionIndex].content}
            </h2>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[currentQuestionIndex].options.map((opt, idx) => {
                const color = optionColors[idx % optionColors.length];
                const isSelected = selectedOptionId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={!!selectedOptionId}
                    className={`p-5 rounded-2xl font-bold text-left transition transform active:scale-95 flex items-start gap-4 text-white ${color.bg} ${color.shadow} border-2 ${color.border} ${
                      isSelected ? "ring-4 ring-white" : ""
                    } ${selectedOptionId && !isSelected ? "opacity-40" : ""}`}
                  >
                    <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-black text-sm shrink-0">
                      {color.label}
                    </span>
                    <span className="text-base leading-snug pt-1">{opt.content}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Overlay Modal */}
            {feedback && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-2 animate-bounce" />
                    <h3 className="text-3xl font-black text-emerald-400">CHÍNH XÁC! 🎉</h3>
                    <div className="text-2xl font-mono font-extrabold text-amber-400 mt-2">
                      +{feedback.pointsEarned} điểm
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-rose-500 mb-2 animate-shake" />
                    <h3 className="text-3xl font-black text-rose-500">RẤT TIẾC, SAI RỒI! ❌</h3>
                    <div className="text-sm text-slate-400 mt-2">Hãy cố gắng ở câu tiếp theo nhé</div>
                  </>
                )}
                <div className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300">
                  🏆 Thứ hạng hiện tại: #{feedback.currentRank} / {feedback.totalPlayers}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FINISHED STEP */}
      {step === "FINISHED" && (
        <div className="w-full max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Hoàn Thành Bài Thi Live
            </span>
            <h2 className="text-3xl font-black text-slate-100 mt-1">{playerName}</h2>
            <p className="text-sm text-slate-400 mt-1">Chúc mừng bạn đã hoàn thành bài thi Quizizz Live!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-semibold">Tổng Điểm</div>
              <div className="text-3xl font-black text-indigo-400 font-mono mt-1">
                {playerStats.score.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Câu Trả Lời Đúng</div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {playerStats.correctAnswers} / {questions.length}
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate("/")}
            className="w-full py-3.5 rounded-xl font-bold"
          >
            Trở Về Trang Chủ
          </Button>
        </div>
      )}
    </div>
  );
};
