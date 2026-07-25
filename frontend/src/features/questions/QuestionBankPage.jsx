import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Filter, Trash2, Edit3, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { QuestionModal } from './QuestionModal';
import api from '../../lib/axios';

export const QuestionBankPage = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedDifficulty, selectedType]);

  const fetchMetadata = async () => {
    try {
      const [resSub, resEx] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/exams/my-exams'),
      ]);
      setSubjects(Array.isArray(resSub.data?.data) ? resSub.data.data : Array.isArray(resSub.data) ? resSub.data : []);
      setExams(Array.isArray(resEx.data?.data) ? resEx.data.data : Array.isArray(resEx.data) ? resEx.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh mục và đề thi:', err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedType) params.type = selectedType;

      const res = await api.get('/questions', { params });
      setQuestions(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách câu hỏi:', err);
    } fontFinally: {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setQuestionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setQuestionToEdit(q);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa câu hỏi');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Ngân Hàng Câu Hỏi</h1>
            <p className="text-sm text-slate-400">Quản lý kho câu hỏi trắc nghiệm theo môn học và độ khó</p>
          </div>
        </div>

        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm Câu Hỏi Mới
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Filter className="w-4 h-4" /> Bộ lọc:
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
        >
          <option value="">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
        >
          <option value="">Tất cả độ khó</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
        >
          <option value="">Tất cả loại câu hỏi</option>
          <option value="SINGLE_CHOICE">Một đáp án</option>
          <option value="MULTIPLE_CHOICE">Nhiều đáp án</option>
          <option value="TRUE_FALSE">Đúng/Sai</option>
        </select>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">
          Đang tải kho câu hỏi...
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Chưa có câu hỏi nào</h3>
          <p className="text-sm text-slate-500 mt-1">Hãy thêm câu hỏi mới để xây dựng ngân hàng đề thi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    Q{index + 1}
                  </span>
                  <div>
                    <p className="text-slate-100 font-semibold text-base leading-snug">{q.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {q.type}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">({q.points} điểm)</span>
                    </div>
                  </div>
                </div>

                {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {q.options?.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${
                      opt.isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium'
                        : 'bg-slate-800/40 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.content}</span>
                    {opt.isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-indigo-400">Lời giải: </span>{q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questionToEdit={questionToEdit}
        subjects={subjects}
        exams={exams}
        onSaveSuccess={fetchQuestions}
      />
    </div>
  );
};
