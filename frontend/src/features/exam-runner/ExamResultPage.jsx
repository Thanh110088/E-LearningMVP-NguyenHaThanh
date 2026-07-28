import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, RotateCcw, Home, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ExamResultPage = ({ user }) => {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [submissionId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/submissions/${submissionId}/result`);
      setResult(res.data?.data || res.data || res);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Không thể tải kết quả thi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-medium animate-pulse">
        Đang tổng hợp kết quả & chấm điểm...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 glass-panel rounded-2xl text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-200">{error || 'Không tìm thấy kết quả'}</h3>
        <Button variant="primary" onClick={() => navigate('/')}>
          Trở về Trang Chủ
        </Button>
      </div>
    );
  }

  const exam = result.exam;
  const questions = exam?.questions || [];

  // Parse student answers
  const studentAnswersMap = {};
  if (result.answersJson && Array.isArray(result.answersJson)) {
    result.answersJson.forEach(item => {
      studentAnswersMap[item.questionId] = item.selectedOptionIds || [];
    });
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Result Header Card */}
      <div className={`glass-panel p-8 rounded-3xl border text-center space-y-6 relative overflow-hidden ${
        result.isPassed
          ? 'border-emerald-500/30 bg-emerald-950/10'
          : 'border-rose-500/30 bg-rose-950/10'
      }`}>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết Quả Thi</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{exam?.title}</h1>
        </div>

        {/* Big Score Display */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-2xl ${
              result.isPassed
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500 bg-rose-500/10 text-rose-400'
            }`}>
              <span className="text-4xl font-black">{result.score}</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold mt-2">Thang điểm {exam?.totalPoints}</span>
          </div>

          <div className="text-left space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-extrabold border ${
              result.isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {result.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.isPassed ? 'ĐẠT (PASSED)' : 'KHÔNG ĐẠT (FAILED)'}
            </span>
            <p className="text-xs text-slate-400">Điểm cần đạt: <strong className="text-slate-200">{exam?.passPoints} điểm</strong></p>
            <p className="text-xs text-slate-400">Thời gian nộp: <strong className="text-slate-200">{new Date(result.submittedAt).toLocaleTimeString()}</strong></p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" /> Về Trang Chủ
          </Button>
          <Button variant="primary" onClick={() => navigate(`/exams/${exam.id}/take`)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Thi Lại Đề Này
          </Button>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" /> Chi Tiết Bài Làm & Lời Giải
        </h3>

        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            const studentSelected = studentAnswersMap[q.id] || [];
            const correctOptionIds = q.options?.filter(o => o.isCorrect).map(o => o.id) || [];
            
            let isUserCorrect = false;
            if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
              isUserCorrect = studentSelected.length === 1 && correctOptionIds.includes(studentSelected[0]);
            } else if (q.type === 'MULTIPLE_CHOICE') {
              const selSorted = [...studentSelected].sort().join(',');
              const corSorted = [...correctOptionIds].sort().join(',');
              isUserCorrect = selSorted === corSorted && selSorted !== '';
            }

            return (
              <div
                key={q.id}
                className={`bg-slate-900 border rounded-2xl p-6 space-y-4 ${
                  isUserCorrect ? 'border-slate-800' : 'border-rose-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isUserCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      Q{qIndex + 1}
                    </span>
                    <div>
                      <p className="text-slate-100 font-semibold text-base leading-snug">{q.content}</p>
                      <span className="text-xs text-slate-400 mt-1 block">({q.points} điểm)</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    isUserCorrect
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isUserCorrect ? '+ ' + q.points + ' điểm' : '0 điểm'}
                  </span>
                </div>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options?.map((opt, oIdx) => {
                    const isSelectedByStudent = studentSelected.includes(opt.id);
                    const isOptionCorrect = opt.isCorrect;

                    let optionStyle = 'bg-slate-800/40 border-slate-800 text-slate-400';
                    if (isOptionCorrect) {
                      optionStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold';
                    } else if (isSelectedByStudent && !isOptionCorrect) {
                      optionStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-semibold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-sm ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt.content}</span>
                        </div>
                        {isSelectedByStudent && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            Bạn chọn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="text-xs text-slate-300 bg-indigo-950/20 border border-indigo-500/20 p-3.5 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-400 block">💡 Lời giải chi tiết:</span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
