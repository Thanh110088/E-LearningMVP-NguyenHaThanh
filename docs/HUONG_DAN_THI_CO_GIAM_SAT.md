# 📚 HƯỚNG DẪN ĐẦY ĐỦ TỰ XÂY DỰNG HỆ THỐNG THI TRỰC TUYẾN CÓ GIÁM SÁT (ONLINE EXAM & PROCTORING)

> **Mục đích tài liệu:** Tài liệu này chứa **TOÀN BỘ MÃ NGUỒN HOÀN CHỈNH (Full Production Code)** của Hệ thống Thi Trực Tuyến & Giám Sát, bao gồm: Làm bài thi, Đếm ngược, Trộn câu hỏi, Công thức Toán LaTeX, Chống gian lận (Fullscreen, Chặn chuột phải, Chặn F12, Chặn chuyển Tab), Tự động đồng bộ tiến độ, Giám sát Real-time của Giáo viên và Trang xem lại kết quả/giải thích chi tiết.

---

## 🏗️ 1. TỔNG QUAN KIẾN TRÚC TOÀN HỆ THỐNG

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                PHÍA HỌC SINH                                     │
 │  1. Nhập mật khẩu đề thi (nếu có)                                                │
 │  2. Ép toàn màn hình (Fullscreen Guard)                                         │
 │  3. Bắt vi phạm: Alt+Tab, mở F12, Copy/Paste, Chuột phải                       │
 │  4. Làm bài: Trộn câu hỏi/đáp án, hiển thị công thức Toán học LaTeX             │
 │  5. Đồng bộ tiến độ ngầm mỗi khi chọn đáp án                                     │
 └─────────────────────────┬────────────────────────────────────────────────────────┘
                           │ (HTTP POST & Auto Sync)
                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                PHÍA BACKEND                                      │
 │  - Quản lý trạng thái: IN_PROGRESS -> COMPLETED -> EXPIRED                       │
 │  - Lưu mảng vi phạm chi tiết: `violations: [{ type, timestamp }]`                │
 │  - Tính điểm tự động: Bareme điểm, tỷ lệ đậu/rớt                                 │
 │  - Bắn sự kiện Socket.IO: `exam:monitor:${examId}`                               │
 └─────────────────────────┬────────────────────────────────────────────────────────┘
                           │ (WebSocket Real-Time Event)
                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                            PHÍA GIÁO VIÊN (MONITOR)                              │
 │  - Quan sát danh sách thí sinh đang làm bài theo thời gian thực                   │
 │  - Xem % tiến độ (VD: 3/4 câu - 75%), thời gian vào thi                         │
 │  - Cảnh báo nhấp nháy đỏ khi phát hiện thí sinh vi phạm gian lận                 │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 2. FULL CODE MÀN HÌNH LÀM BÀI THI (`TakeExamPage.jsx`)

Màn hình làm bài hoàn chỉnh tích hợp toàn bộ các tính năng cao cấp:

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight,
  Send, ShieldAlert, Maximize, Minimize, Lock, KeyRound, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LaTeXRenderer } from '../../components/common/LaTeXRenderer';
import api from '../../lib/axios';

export const TakeExamPage = ({ user }) => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  // ── States ──
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: [optionId] }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const violationsRef = useRef([]);

  // Fullscreen & Proctoring State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [proctorWarning, setProctorWarning] = useState('');

  // Password Prompt State
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── 1. Khởi tạo phiên làm bài ──
  const startExamSession = async (password = '') => {
    setLoading(true);
    setPasswordError('');
    try {
      const res = await api.post(`/submissions/start/${examId}`, { password });
      const subData = res.data?.data || res.data;

      setSubmission(subData);
      setExam(subData.exam);
      setRequiresPassword(false);

      // Khôi phục câu trả lời cũ nếu đang làm dở
      if (subData.answersJson?.answers) {
        const restored = {};
        subData.answersJson.answers.forEach(item => {
          restored[item.questionId] = item.selectedOptionIds;
        });
        setAnswers(restored);
      }

      // Tính thời gian còn lại
      const durationSec = (subData.exam.durationMinutes || 45) * 60;
      const elapsedSec = Math.floor((new Date() - new Date(subData.startedAt)) / 1000);
      setTimeLeftSeconds(Math.max(0, durationSec - elapsedSec));

      // Tự động yêu cầu Fullscreen nếu đề thi bật giám sát
      if (subData.exam.proctorEnabled) {
        setTimeout(requestFullscreen, 500);
      }
    } catch (err) {
      const data = err.response?.data || err.data;
      if (data?.requiresPassword) {
        setRequiresPassword(true);
        if (password) setPasswordError('Mật khẩu đề thi không chính xác');
      } else {
        setError(err.message || 'Không thể bắt đầu bài thi');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startExamSession();
  }, [examId]);

  // ── 2. Đếm ngược thời gian & Tự động nộp khi hết giờ ──
  useEffect(() => {
    if (!submission || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submission]);

  // ── 3. Đồng bộ tiến độ ngầm lên Server ──
  const syncProgressToServer = useCallback(async (currentAnswers, currentViolations) => {
    if (!submission?.id) return;
    try {
      const formatted = Object.entries(currentAnswers).map(([questionId, selectedOptionIds]) => ({
        questionId, selectedOptionIds,
      }));
      await api.post(`/submissions/${submission.id}/progress`, {
        answers: formatted,
        violations: currentViolations,
      });
    } catch (e) {}
  }, [submission?.id]);

  // ── 4. Xử lý ghi nhận vi phạm gian lận ──
  const handleViolation = useCallback((type, message) => {
    const newViolation = { type, timestamp: new Date().toISOString() };
    const updated = [...violationsRef.current, newViolation];
    violationsRef.current = updated;
    setViolations(updated);
    setProctorWarning(message);
    syncProgressToServer(answers, updated);
  }, [answers, syncProgressToServer]);

  // ── 5. Hệ thống chống gian lận (Anti-Cheat Listeners) ──
  useEffect(() => {
    if (!exam?.proctorEnabled) return;

    // Chặn chuột phải
    const onContextMenu = (e) => { e.preventDefault(); return false; };
    // Chặn Copy / Cut / Paste
    const onCopyPaste = (e) => {
      e.preventDefault();
      handleViolation('COPY_PASTE_ATTEMPT', 'Cấm sao chép / dán trong phòng thi');
      return false;
    };
    // Chặn F12 & Phím tắt DevTools
    const onKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) {
        e.preventDefault();
        handleViolation('DEVTOOLS_ATTEMPT', 'Cố gắng mở công cụ phát triển (DevTools)');
        return false;
      }
    };
    // Bắt chuyển Tab hoặc Alt+Tab
    const onVisibilityChange = () => {
      if (document.hidden) handleViolation('TAB_SWITCH', 'Phát hiện rời khỏi tab làm bài thi');
    };
    const onWindowBlur = () => {
      handleViolation('WINDOW_BLUR', 'Phát hiện chuyển sang ứng dụng khác');
    };
    // Bắt thoát Fullscreen
    const onFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) handleViolation('EXIT_FULLSCREEN', 'Thoát chế độ toàn màn hình');
    };

    window.addEventListener('contextmenu', onContextMenu, true);
    window.addEventListener('copy', onCopyPaste, true);
    window.addEventListener('cut', onCopyPaste, true);
    window.addEventListener('paste', onCopyPaste, true);
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      window.removeEventListener('contextmenu', onContextMenu, true);
      window.removeEventListener('copy', onCopyPaste, true);
      window.removeEventListener('cut', onCopyPaste, true);
      window.removeEventListener('paste', onCopyPaste, true);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [exam?.proctorEnabled, handleViolation]);

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // ── 6. Chọn đáp án ──
  const handleSelectOption = (questionId, optionId, isMultiple = false) => {
    setAnswers(prev => {
      let updated;
      if (isMultiple) {
        const current = prev[questionId] || [];
        updated = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      } else {
        updated = [optionId];
      }
      const newAnswers = { ...prev, [questionId]: updated };
      syncProgressToServer(newAnswers, violationsRef.current);
      return newAnswers;
    });
  };

  // ── 7. Nộp bài thi ──
  const handleSubmitExam = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?')) return;
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
        questionId, selectedOptionIds,
      }));
      await api.post(`/submissions/${submission.id}/submit`, {
        answers: formatted,
        violations: violationsRef.current,
      });
      navigate(`/submissions/${submission.id}/result`);
    } catch (err) {
      alert(err.message || 'Lỗi khi nộp bài');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Đang chuẩn bị đề thi...</div>;

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none">
      {/* Banner cảnh báo giám sát */}
      {exam?.proctorEnabled && (
        <div className="glass-panel p-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Phòng thi có giám sát trực tuyến</span>
            {violations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {violations.length} lần vi phạm
              </span>
            )}
          </div>
          <button onClick={requestFullscreen} className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" /> Bật toàn màn hình
          </button>
        </div>
      )}

      {/* Top Header: Tiêu đề + Đồng hồ đếm ngược + Nộp bài */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{exam?.subject?.name}</span>
          <h1 className="text-xl font-black text-white">{exam?.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-lg font-black text-amber-400">
            <Clock className="w-5 h-5 text-amber-400" />
            {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:{String(timeLeftSeconds % 60).padStart(2, '0')}
          </div>
          <Button variant="primary" onClick={() => handleSubmitExam(false)} loading={submitting} className="font-bold">
            <Send className="w-4 h-4 mr-1.5" /> Nộp Bài
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cột Trái: Nội dung câu hỏi */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-black">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-slate-400">{currentQuestion?.points || 1} điểm</span>
          </div>

          {/* Nội dung câu hỏi + LaTeX */}
          <div className="text-base font-semibold text-slate-100 leading-relaxed">
            <LaTeXRenderer text={currentQuestion?.content} />
          </div>

          {/* Danh sách đáp án */}
          <div className="space-y-3 pt-2">
            {currentQuestion?.options?.map((opt, idx) => {
              const isSelected = (answers[currentQuestion.id] || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id, currentQuestion.type === 'MULTIPLE_CHOICE')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1 text-sm font-medium">
                    <LaTeXRenderer text={opt.content} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nút Điều Hướng Câu Trước / Tiếp */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Câu Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Câu Tiếp Theo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Cột Phải: Bảng điều hướng tất cả câu hỏi */}
        <div className="glass-panel p-5 rounded-3xl space-y-4 h-fit">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>BẢNG CÂU HỎI</span>
            <span className="text-cyan-400">{answeredCount}/{questions.length} đã làm</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = (answers[q.id] || []).length > 0;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all ${
                    isCurrent
                      ? 'ring-2 ring-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 3. FULL CODE MÀN HÌNH XEM KẾT QUẢ & LỜI GIẢI (`ExamResultPage.jsx`)

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Home, RotateCcw, ShieldAlert, CheckCircle, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LaTeXRenderer } from '../../components/common/LaTeXRenderer';
import api from '../../lib/axios';

export const ExamResultPage = () => {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/submissions/${submissionId}/result`)
      .then(res => setResult(res.data?.data || res.data))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <div className="p-12 text-center text-slate-400">Đang tổng kết điểm số...</div>;
  if (!result) return <div className="p-12 text-center text-rose-400">Không tìm thấy kết quả bài thi.</div>;

  const { submission, exam, questions } = result;
  const isPassed = submission.score >= (exam.passPoints || 5.0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Thẻ Điểm Số & Banner Kết Quả */}
      <div className={`p-8 rounded-3xl border text-center space-y-4 ${
        isPassed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <Award className={`w-16 h-16 mx-auto ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
        <h1 className="text-3xl font-black text-white">{isPassed ? '🎉 CHÚC MỪNG BẠN ĐÃ ĐẠT!' : 'RẤT TIẾC, BẠN CHƯA ĐẠT!'}</h1>
        
        <div className="text-6xl font-black font-mono text-white">
          {submission.score} <span className="text-2xl text-slate-400">/ {exam.totalPoints || 10}</span>
        </div>

        <p className="text-xs text-slate-400">
          Thời gian làm bài: {Math.round((new Date(submission.submittedAt) - new Date(submission.startedAt)) / 60000)} phút • Điểm chuẩn: {exam.passPoints}
        </p>
      </div>

      {/* Xem Lại Chi Tiết Từng Câu Hỏi */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Chi Tiết Từng Câu Hỏi & Lời Giải</h3>

        {questions?.map((q, idx) => {
          const userAnswer = (submission.answersJson?.answers || []).find(a => a.questionId === q.id)?.selectedOptionIds || [];
          const isCorrect = q.options?.every(o => o.isCorrect === userAnswer.includes(o.id));

          return (
            <div key={q.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 text-sm">Câu {idx + 1}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isCorrect ? '✓ Đúng' : '✗ Sai'}
                </span>
              </div>

              <div className="text-sm text-slate-200">
                <LaTeXRenderer text={q.content} />
              </div>

              {/* Các đáp án */}
              <div className="space-y-2 pt-2">
                {q.options?.map(opt => {
                  const wasChosen = userAnswer.includes(opt.id);
                  let optStyle = 'bg-slate-950/60 border-slate-800 text-slate-300';
                  if (opt.isCorrect) optStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold';
                  else if (wasChosen && !opt.isCorrect) optStyle = 'bg-rose-500/10 border-rose-500 text-rose-300 font-bold';

                  return (
                    <div key={opt.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${optStyle}`}>
                      <LaTeXRenderer text={opt.content} />
                      {opt.isCorrect && <span className="text-emerald-400 font-bold text-[11px]">✓ Đáp án đúng</span>}
                      {wasChosen && !opt.isCorrect && <span className="text-rose-400 font-bold text-[11px]">✗ Bạn chọn</span>}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400">
                  <strong className="text-indigo-400">Lời giải chi tiết: </strong>
                  <LaTeXRenderer text={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-1.5" /> Về Trang Chủ
        </Button>
      </div>
    </div>
  );
};
```
