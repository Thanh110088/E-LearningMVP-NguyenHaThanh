import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Send, AlertTriangle, HelpCircle, Lock, CalendarClock,
  Maximize2, Minimize2, Save,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LaTeXRenderer } from '../../components/common/LaTeXRenderer';
import { ExamProctorGuard } from './ExamProctorGuard';
import api from '../../lib/axios';

// ─── Màn hình nhập mật khẩu phòng thi ───────────────────────────────────────
const ExamPasswordScreen = ({ examCode, onSubmit, loading, error }) => {
  const [pw, setPw] = useState('');
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-sm w-full mx-auto p-8 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Phòng Thi Có Mật Khẩu</h2>
          <p className="text-sm text-slate-400 mt-1">Nhập mật khẩu do giám thị cung cấp để vào phòng thi.</p>
        </div>
        {error && <p className="text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">{error}</p>}
        <div className="space-y-3">
          <input
            type="text"
            value={pw}
            onChange={(e) => setPw(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(pw)}
            placeholder="Nhập mật khẩu..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold text-slate-100 tracking-widest focus:outline-none focus:border-amber-500"
          />
          <Button variant="primary" className="w-full bg-amber-500 hover:bg-amber-400 border-0 text-slate-900 font-black"
            onClick={() => onSubmit(pw)} loading={loading}>
            Vào Phòng Thi
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Màn hình phòng thi chưa mở ────────────────────────────────────────────
const ExamNotStartedScreen = ({ startTime, onRetry }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="max-w-sm w-full mx-auto p-8 bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl space-y-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto">
        <CalendarClock className="w-8 h-8 text-sky-400" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Phòng Thi Chưa Mở</h2>
        <p className="text-sm text-slate-400 mt-1">
          Phòng thi sẽ mở lúc:{' '}
          <strong className="text-sky-300">{startTime ? new Date(startTime).toLocaleString('vi-VN') : '—'}</strong>
        </p>
      </div>
      <Button variant="outline" onClick={onRetry} className="w-full">Thử Lại</Button>
    </div>
  </div>
);

// ─── Main TakeExamPage ────────────────────────────────────────────────────────
export const TakeExamPage = ({ user }) => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Kiểm soát phòng thi ──
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Anti-cheat violations state ──
  const [violations, setViolations] = useState([]);
  const violationsRef = useRef([]);

  // ── Auto-save progress to Server and LocalStorage ──
  const syncProgressToServer = useCallback(async (currentAnswers, currentViolations) => {
    if (!submission?.id) return;
    try {
      const formatted = Object.entries(currentAnswers).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds,
      }));
      const tabSwitchCount = currentViolations.filter(v => v.type === 'TAB_SWITCH' || v.type === 'WINDOW_BLUR').length;
      await api.post(`/submissions/${submission.id}/progress`, {
        answers: formatted,
        tabSwitchCount,
        violations: currentViolations,
      });
    } catch (e) {
      // Background sync, ignore error
    }
  }, [submission?.id]);

  // LocalStorage Auto-save Draft & Server sync
  useEffect(() => {
    if (examId && Object.keys(answers).length > 0) {
      localStorage.setItem(`etech_draft_${examId}`, JSON.stringify(answers));
      syncProgressToServer(answers, violationsRef.current);
    }
  }, [answers, examId, syncProgressToServer]);

  const handleViolation = useCallback((type) => {
    const v = { type, timestamp: new Date().toISOString() };
    violationsRef.current = [...violationsRef.current, v];
    setViolations(prev => {
      const updated = [...prev, v];
      syncProgressToServer(answers, updated);
      return updated;
    });
  }, [answers, syncProgressToServer]);

  // ── Fullscreen API ──
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFullscreen(isFull);
      if (!isFull && exam?.proctorEnabled) {
        handleViolation('EXIT_FULLSCREEN');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [exam, handleViolation]);

  // ── Start exam on mount ──
  useEffect(() => {
    startExamSession();
  }, [examId]);

  // ── Countdown timer ──
  useEffect(() => {
    if (timeLeftSeconds <= 0 || !submission) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds, submission]);

  const startExamSession = async (password = '') => {
    if (!examId || examId === ':id') {
      setError('Mã bài thi không hợp lệ. Vui lòng quay lại Trang Chủ để chọn lại đề thi.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setPasswordError('');
    try {
      const res = await api.post(`/submissions/start/${examId}`, { password });
      const subData = res.data?.data || res.data || res;

      if (!subData || !subData.exam) throw new Error('Dữ liệu bài thi không hợp lệ');

      setSubmission(subData);
      setExam(subData.exam);
      setRequiresPassword(false);
      setExamStartTime(null);

      // Restore existing answers if resuming
      if (subData.answersJson && Array.isArray(subData.answersJson.answers || subData.answersJson)) {
        const raw = subData.answersJson.answers || subData.answersJson;
        const restoredMap = {};
        if (Array.isArray(raw)) raw.forEach(item => { restoredMap[item.questionId] = item.selectedOptionIds; });
        setAnswers(restoredMap);
      }

      // Calculate remaining time
      const durationSec = (subData.exam.durationMinutes || 45) * 60;
      const elapsedSec = Math.floor((new Date().getTime() - new Date(subData.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, durationSec - elapsedSec);
      setTimeLeftSeconds(remaining);

      // Auto-request fullscreen if proctoring enabled
      if (subData.exam.proctorEnabled) {
        setTimeout(requestFullscreen, 500);
      }
    } catch (err) {
      const data = err.response?.data || err.data;
      if (data?.requiresPassword) {
        setRequiresPassword(true);
        setPasswordError(password ? (data.message || 'Mật khẩu không đúng') : '');
        setLoading(false);
        return;
      }
      if (data?.examStartTime) {
        setExamStartTime(data.examStartTime);
        setLoading(false);
        return;
      }
      setError(data?.message || err.message || 'Không thể bắt đầu lượt làm bài thi');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (pw) => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await startExamSession(pw);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId, questionType) => {
    setAnswers(prev => {
      const currentSelected = prev[questionId] || [];
      if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        const isAlreadySelected = currentSelected.includes(optionId);
        const updated = isAlreadySelected
          ? currentSelected.filter(id => id !== optionId)
          : [...currentSelected, optionId];
        return { ...prev, [questionId]: updated };
      }
    });
  };

  const formatAnswersPayload = () =>
    Object.entries(answers).map(([questionId, selectedOptionIds]) => ({ questionId, selectedOptionIds }));

  const handleAutoSubmit = () => {
    handleSubmitExam(true);
  };

  const handleSubmitExam = async (isAuto = false) => {
    if (submitting) return;
    if (!isAuto) {
      const unanswered = (exam?.questions || []).filter(q => !(answers[q.id]?.length > 0)).length;
      if (unanswered > 0 && !window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) return;
    }
    setSubmitting(true);
    try {
      const tabSwitchCount = violations.filter(v => v.type === 'TAB_SWITCH' || v.type === 'WINDOW_BLUR').length;
      const payload = {
        answers: formatAnswersPayload(),
        tabSwitchCount,
        violations: violationsRef.current,
      };
      await api.post(`/submissions/${submission.id}/submit`, payload);
      localStorage.removeItem(`etech_draft_${examId}`);
      if (isFullscreen) exitFullscreen();
      navigate(`/submissions/${submission.id}/result`);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài');
      setSubmitting(false);
    }
  };

  // ── Render states ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-medium animate-pulse">
        Đang khởi tạo phòng thi trực tuyến...
      </div>
    );
  }

  if (examStartTime) {
    return <ExamNotStartedScreen startTime={examStartTime} onRetry={() => startExamSession()} />;
  }

  if (requiresPassword) {
    return (
      <ExamPasswordScreen
        examCode={examId}
        onSubmit={handlePasswordSubmit}
        loading={passwordLoading}
        error={passwordError}
      />
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 glass-panel rounded-3xl text-center space-y-4 border border-rose-500/30">
        <AlertTriangle className="w-14 h-14 text-rose-400 mx-auto animate-bounce" />
        <h3 className="text-xl font-bold text-slate-100">{error || 'Không thể bắt đầu lượt làm bài thi'}</h3>
        {error?.includes('chưa có câu hỏi') && (
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
            💡 <strong>Hướng dẫn:</strong> Giáo viên cần vào trang <strong>"Đề Thi" → "⚡ Gán Câu Hỏi"</strong> để thêm câu hỏi vào đề trước khi học sinh bắt đầu thi.
          </p>
        )}
        <Button variant="primary" onClick={() => navigate('/')}>Trở về Trang Chủ</Button>
      </div>
    );
  }

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const totalViolations = violations.length;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(qId => answers[qId] && answers[qId].length > 0).length;

  return (
    <ExamProctorGuard
      proctorEnabled={exam.proctorEnabled}
      onViolation={handleViolation}
      violationCount={totalViolations}
      isFullscreen={isFullscreen}
      onRequestFullscreen={requestFullscreen}
    >
      <div className="max-w-7xl mx-auto pb-16 space-y-6">
        {/* Top Bar */}
        <div className="sticky top-20 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {exam.subject?.name} • {exam.code}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">{exam.title}</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Violation Badge */}
            {totalViolations > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Vi phạm: {totalViolations} lần</span>
              </div>
            ) : exam.proctorEnabled ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span>🛡️ Giám Sát BẬT</span>
              </div>
            ) : null}

            {/* Fullscreen Toggle Button */}
            <button
              onClick={isFullscreen ? exitFullscreen : requestFullscreen}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isFullscreen
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Thoát Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Toàn Màn Hình</span>
                </>
              )}
            </button>

            {/* Countdown */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
              <Clock className={`w-5 h-5 ${timeLeftSeconds < 300 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Thời gian còn lại</p>
                <span className={`text-lg font-mono font-extrabold ${timeLeftSeconds < 300 ? 'text-rose-400' : 'text-slate-100'}`}>
                  {formatTime(timeLeftSeconds)}
                </span>
              </div>
            </div>

            <Button variant="primary" onClick={() => handleSubmitExam(false)} loading={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 border-0 font-bold">
              <Send className="w-4 h-4" /> Nộp Bài
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
                  Câu {currentQuestionIdx + 1} / {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentQuestion?.type === 'SINGLE_CHOICE' ? 'Chọn 1 đáp án' : currentQuestion?.type === 'TRUE_FALSE' ? 'Đúng / Sai' : 'Chọn nhiều đáp án'}{' '}
                  ({currentQuestion?.points} điểm)
                </span>
              </div>

              <div className="text-lg font-semibold text-slate-100 leading-relaxed">
                <LaTeXRenderer content={currentQuestion?.content} />
              </div>

              <div className="space-y-3 pt-2">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(currentQuestion.id, option.id, currentQuestion.type)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="text-base font-medium">
                        <LaTeXRenderer content={option.content} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <Button variant="outline" disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}>
                  ← Câu Trước
                </Button>
                <Button variant="outline" disabled={currentQuestionIdx === questions.length - 1}
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}>
                  Câu Tiếp →
                </Button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Question Palette */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-indigo-400" /> Bảng Câu Hỏi</span>
                <span className="text-xs text-indigo-400 font-semibold">{answeredCount}/{questions.length} đã làm</span>
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] && answers[q.id].length > 0;
                  const isCurrent = i === currentQuestionIdx;
                  return (
                    <button key={q.id} onClick={() => setCurrentQuestionIdx(i)}
                      className={`h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950 bg-indigo-600 text-white'
                          : isAnswered
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exam Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
              {exam.endTime && (
                <p className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
                  Kết thúc: <strong className="text-slate-200">{new Date(exam.endTime).toLocaleTimeString('vi-VN')}</strong>
                </p>
              )}
              {exam.shuffleQuestions && (
                <p className="text-indigo-400 font-semibold">🔀 Đề thi đã được trộn câu hỏi</p>
              )}
              {exam.maxAttempts > 0 && (
                <p>Số lần thi tối đa: <strong className="text-slate-200">{exam.maxAttempts} lần</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ExamProctorGuard>
  );
};
