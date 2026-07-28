import React, { useState, useEffect } from 'react';
import { X, Check, Plus, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const AssignQuestionModal = ({ isOpen, onClose, exam, onSaveSuccess }) => {
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'quick'
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Quick Create Form State
  const [quickContent, setQuickContent] = useState('');
  const [quickOptA, setQuickOptA] = useState('');
  const [quickOptB, setQuickOptB] = useState('');
  const [quickOptC, setQuickOptC] = useState('');
  const [quickOptD, setQuickOptD] = useState('');
  const [correctOptIdx, setCorrectOptIdx] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && exam) {
      fetchBankQuestions();
    }
  }, [isOpen, exam]);

  const fetchBankQuestions = async () => {
    setLoading(true);
    try {
      // Get all questions for this subject
      const res = await api.get('/questions', { params: { subjectId: exam.subjectId } });
      const questions = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setBankQuestions(questions);

      // Pre-select questions that belong to this exam
      const assignedIds = questions.filter(q => q.examId === exam.id).map(q => q.id);
      setSelectedQuestionIds(assignedIds);
    } catch (err) {
      console.error('Lỗi lấy câu hỏi:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !exam) return null;

  const handleToggleSelect = (qId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.length === bankQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(bankQuestions.map(q => q.id));
    }
  };

  const handleAssignBankQuestions = async () => {
    setSaving(true);
    setError('');
    try {
      // Update examId for selected questions
      await Promise.all(
        bankQuestions.map(q => {
          const isSelected = selectedQuestionIds.includes(q.id);
          const currentExamId = q.examId;
          if (isSelected && currentExamId !== exam.id) {
            return api.put(`/questions/${q.id}`, { examId: exam.id });
          } else if (!isSelected && currentExamId === exam.id) {
            return api.put(`/questions/${q.id}`, { examId: null });
          }
          return Promise.resolve();
        })
      );
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gán câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!quickContent.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (!quickOptA.trim() || !quickOptB.trim()) {
      setError('Vui lòng nhập ít nhất phương án A và B');
      return;
    }

    const optionsPayload = [
      { content: quickOptA, isCorrect: correctOptIdx === 0 },
      { content: quickOptB, isCorrect: correctOptIdx === 1 },
    ];
    if (quickOptC.trim()) optionsPayload.push({ content: quickOptC, isCorrect: correctOptIdx === 2 });
    if (quickOptD.trim()) optionsPayload.push({ content: quickOptD, isCorrect: correctOptIdx === 3 });

    setSaving(true);
    try {
      await api.post('/questions', {
        content: quickContent,
        subjectId: exam.subjectId,
        examId: exam.id,
        type: 'SINGLE_CHOICE',
        difficulty: 'MEDIUM',
        points: 5.0,
        options: optionsPayload,
      });

      // Clear form
      setQuickContent('');
      setQuickOptA('');
      setQuickOptB('');
      setQuickOptC('');
      setQuickOptD('');
      setCorrectOptIdx(0);

      fetchBankQuestions();
      onSaveSuccess();
      setActiveTab('bank');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo nhanh câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{exam.code}</span>
            <h3 className="text-lg font-bold text-slate-100">Gán Câu Hỏi Cho Đề: {exam.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('bank')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'bank'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chọn từ Ngân Hàng ({bankQuestions.length} câu)
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tạo Nhanh Câu Hỏi Mới
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {activeTab === 'bank' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Đã chọn: <strong className="text-indigo-400">{selectedQuestionIds.length}</strong> câu hỏi
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  {selectedQuestionIds.length === bankQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-400 text-xs animate-pulse">
                  Đang tải danh sách câu hỏi...
                </div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Chưa có câu hỏi nào trong ngân hàng môn học này. Hãy chọn tab "Tạo Nhanh Câu Hỏi Mới".
                </div>
              ) : (
                <div className="space-y-2.5">
                  {bankQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleSelect(q.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-slate-100'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-200">{q.content}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">({q.points} điểm • {q.difficulty})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Quick Create Tab */
            <form onSubmit={handleQuickCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Nội dung câu hỏi</label>
                <input
                  type="text"
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  placeholder="VD: Thủ đô của Việt Nam là gì?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase">Các đáp án & Chọn đáp án ĐÚNG</label>
                
                {[
                  { val: quickOptA, set: setQuickOptA, label: 'Phương án A', idx: 0 },
                  { val: quickOptB, set: setQuickOptB, label: 'Phương án B', idx: 1 },
                  { val: quickOptC, set: setQuickOptC, label: 'Phương án C', idx: 2 },
                  { val: quickOptD, set: setQuickOptD, label: 'Phương án D', idx: 3 },
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctQuickOpt"
                      checked={correctOptIdx === item.idx}
                      onChange={() => setCorrectOptIdx(item.idx)}
                      className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      placeholder={item.label}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <Button variant="primary" type="submit" loading={saving} className="w-full text-xs font-bold py-2.5">
                <Plus className="w-4 h-4 mr-1.5" /> Tạo & Gán Trực Tiếp Vào Đề Thi Này
              </Button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'bank' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAssignBankQuestions} loading={saving}>
              Lưu & Cập Nhật Đề Thi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
