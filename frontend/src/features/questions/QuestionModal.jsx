import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const QuestionModal = ({ isOpen, onClose, questionToEdit, subjects, exams, onSaveSuccess }) => {
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examId, setExamId] = useState('');
  const [type, setType] = useState('SINGLE_CHOICE');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [points, setPoints] = useState(1.0);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (questionToEdit) {
      setContent(questionToEdit.content || '');
      setSubjectId(questionToEdit.subjectId || '');
      setExamId(questionToEdit.examId || '');
      setType(questionToEdit.type || 'SINGLE_CHOICE');
      setDifficulty(questionToEdit.difficulty || 'MEDIUM');
      setPoints(questionToEdit.points || 1.0);
      setExplanation(questionToEdit.explanation || '');
      setOptions(
        questionToEdit.options && questionToEdit.options.length > 0
          ? questionToEdit.options.map(o => ({ content: o.content, isCorrect: o.isCorrect }))
          : [
            { content: '', isCorrect: true },
            { content: '', isCorrect: false },
          ]
      );
    } else {
      setContent('');
      setSubjectId(subjects && subjects.length > 0 ? subjects[0].id : '');
      setExamId('');
      setType('SINGLE_CHOICE');
      setDifficulty('MEDIUM');
      setPoints(1.0);
      setExplanation('');
      setOptions([
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
      ]);
    }
    setError('');
  }, [questionToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleOptionContentChange = (index, value) => {
    const updated = [...options];
    updated[index].content = value;
    setOptions(updated);
  };

  const handleToggleCorrect = (index) => {
    if (type === 'SINGLE_CHOICE' || type === 'TRUE_FALSE') {
      const updated = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }));
      setOptions(updated);
    } else {
      const updated = [...options];
      updated[index].isCorrect = !updated[index].isCorrect;
      setOptions(updated);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { content: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError('Câu hỏi phải có ít nhất 2 đáp án');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (options.some(o => !o.content.trim())) {
      setError('Nội dung các đáp án không được để trống');
      return;
    }

    if (!options.some(o => o.isCorrect)) {
      setError('Vui lòng chọn ít nhất 1 đáp án đúng');
      return;
    }

    const payload = {
      content,
      subjectId: subjectId || null,
      examId: examId || null,
      type,
      difficulty,
      points: parseFloat(points),
      explanation,
      options,
    };

    setLoading(true);
    try {
      if (questionToEdit) {
        await api.put(`/questions/${questionToEdit.id}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {questionToEdit ? 'Chỉnh Sửa Câu Hỏi' : 'Tạo Câu Hỏi Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Subject & Exam & Type & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Môn học</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Gán vào Đề Thi (Tùy chọn)</label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Không chọn (Để trong Ngân hàng) --</option>
                {exams?.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.title} ({ex.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Loại câu hỏi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="SINGLE_CHOICE">Một đáp án (Single)</option>
                <option value="MULTIPLE_CHOICE">Nhiều đáp án (Multiple)</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="EASY">Dễ (Easy)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HARD">Khó (Hard)</option>
              </select>
            </div>
          </div>

          {/* Question Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nội dung câu hỏi</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi tại đây..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Danh sách phương án trả lời</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm đáp án
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => handleToggleCorrect(idx)}
                    className={`p-1 rounded-lg transition-colors ${opt.isCorrect
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    title={opt.isCorrect ? 'Đáp án Đúng' : 'Đánh dấu là Đúng'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={opt.content}
                    onChange={(e) => handleOptionContentChange(idx, e.target.value)}
                    placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Lời giải / Giải thích (Tùy chọn)</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích lý do đáp án đúng..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {questionToEdit ? 'Lưu Cập Nhật' : 'Tạo Câu Hỏi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
