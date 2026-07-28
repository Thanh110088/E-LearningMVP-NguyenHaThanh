import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const TakeExamPage = ({ user }) => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: [optionIds] }
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    startExamSession();
  }, [examId]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;

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
  }, [timeLeftSeconds]);

  const startExamSession = async () => {
    if (!examId || examId === ':id') {
      setError('Mã bài thi không hợp lệ. Vui lòng quay lại Trang Chủ để chọn lại đề thi.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/submissions/start/${examId}`);
      const subData = res.data?.data || res.data || res;
      
      if (!subData || !subData.exam) {
        throw new Error('Dữ liệu bài thi không hợp lệ');
      }

      setSubmission(subData);
      setExam(subData.exam);

      // Restore existing answers if resuming
      if (subData.answersJson && Array.isArray(subData.answersJson)) {
        const restoredMap = {};
        subData.answersJson.forEach(item => {
          restoredMap[item.questionId] = item.selectedOptionIds;
        });
        setAnswers(restoredMap);
      }

      // Calculate remaining time
      const durationSec = (subData.exam.durationMinutes || 45) * 60;
      const elapsedSec = Math.floor((new Date().getTime() - new Date(subData.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, durationSec - elapsedSec);
      setTimeLeftSeconds(remaining);
    } catch (err) {
      console.error('Lỗi khởi tạo lượt thi:', err);
      setError(err.message || err.response?.data?.message || 'Không thể bắt đầu lượt làm bài thi');
    } finally {
      setLoading(false);
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

  const formatAnswersPayload = () => {
    return Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
      questionId,
      selectedOptionIds,
    }));
  };

  const handleAutoSubmit = () => {
    alert('Hết giờ làm bài! Hệ thống sẽ tự động nộp bài thi của bạn.');
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { answers: formatAnswersPayload() };
      const res = await api.post(`/submissions/${submission.id}/submit`, payload);
      navigate(`/submissions/${submission.id}/result`);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-medium animate-pulse">
        Đang khởi tạo phòng thi trực tuyến...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 glass-panel rounded-3xl text-center space-y-4 border border-rose-500/30">
        <AlertTriangle className="w-14 h-14 text-rose-400 mx-auto animate-bounce" />
        <h3 className="text-xl font-bold text-slate-100">{error || 'Không thể bắt đầu lượt làm bài thi'}</h3>
        {error?.includes('chưa có câu hỏi') && (
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
            💡 <strong>Hướng dẫn:</strong> Đề thi này hiện đang có <strong>0 câu hỏi</strong>. Giáo viên cần vào trang <strong>"Đề Thi" ➔ nhấn nút "⚡ Gán Câu Hỏi"</strong> để thêm câu hỏi vào đề trước khi Học sinh bắt đầu thi.
          </p>
        )}
        <Button variant="primary" onClick={() => navigate('/')}>
          Trở về Trang Chủ
        </Button>
      </div>
    );
  }

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(qId => answers[qId] && answers[qId].length > 0).length;

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-6">
      {/* Top Bar: Exam Title & Countdown Timer */}
      <div className="sticky top-20 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {exam.subject?.name} • {exam.code}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-100">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
            <Clock className={`w-5 h-5 ${timeLeftSeconds < 300 ? 'text-rose-400 animate-bounce' : 'text-indigo-400'}`} />
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Thời gian còn lại</p>
              <span className={`text-lg font-mono font-extrabold ${timeLeftSeconds < 300 ? 'text-rose-400' : 'text-slate-100'}`}>
                {formatTime(timeLeftSeconds)}
              </span>
            </div>
          </div>

          <Button variant="primary" onClick={handleSubmitExam} loading={submitting} className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Nộp Bài Thi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Display */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                Câu hỏi {currentQuestionIdx + 1} / {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentQuestion?.type === 'SINGLE_CHOICE' ? 'Chọn 1 đáp án' : 'Chọn nhiều đáp án'} ({currentQuestion?.points} điểm)
              </span>
            </div>

            {/* Question Content */}
            <p className="text-lg font-semibold text-slate-100 leading-relaxed">
              {currentQuestion?.content}
            </p>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion?.options?.map((option, idx) => {
                const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id, currentQuestion.type)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-base font-medium">{option.content}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <Button
                variant="outline"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              >
                Câu Trước
              </Button>
              <Button
                variant="outline"
                disabled={currentQuestionIdx === questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              >
                Câu Tiếp Theo
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel Question Palette */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Danh Sách Câu Hỏi</span>
              <span className="text-xs text-indigo-400 font-semibold">{answeredCount}/{questions.length} Đã làm</span>
            </h3>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] && answers[q.id].length > 0;
                const isCurrent = i === currentQuestionIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(i)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
