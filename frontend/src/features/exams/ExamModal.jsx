import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ExamModal = ({ isOpen, onClose, examToEdit, subjects, grades, onSaveSuccess }) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalPoints, setTotalPoints] = useState(10.0);
  const [passPoints, setPassPoints] = useState(5.0);
  const [status, setStatus] = useState('DRAFT');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (examToEdit) {
      setTitle(examToEdit.title || '');
      setCode(examToEdit.code || '');
      setDescription(examToEdit.description || '');
      setSubjectId(examToEdit.subjectId || '');
      setGradeId(examToEdit.gradeId || '');
      setDurationMinutes(examToEdit.durationMinutes || 45);
      setTotalPoints(examToEdit.totalPoints || 10.0);
      setPassPoints(examToEdit.passPoints || 5.0);
      setStatus(examToEdit.status || 'DRAFT');
    } else {
      setTitle('');
      setCode(`EXAM-${Date.now().toString().slice(-6)}`);
      setDescription('');
      setSubjectId(subjects && subjects.length > 0 ? subjects[0].id : '');
      setGradeId(grades && grades.length > 0 ? grades[0].id : '');
      setDurationMinutes(45);
      setTotalPoints(10.0);
      setPassPoints(5.0);
      setStatus('DRAFT');
    }
    setError('');
  }, [examToEdit, isOpen, subjects, grades]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đề thi');
      return;
    }
    if (!code.trim()) {
      setError('Vui lòng nhập mã đề thi');
      return;
    }
    if (!subjectId || !gradeId) {
      setError('Vui lòng chọn môn học và khối lớp');
      return;
    }

    const payload = {
      title,
      code,
      description,
      subjectId,
      gradeId,
      durationMinutes: parseInt(durationMinutes, 10),
      totalPoints: parseFloat(totalPoints),
      passPoints: parseFloat(passPoints),
      status,
    };

    setLoading(true);
    try {
      if (examToEdit) {
        await api.put(`/exams/${examToEdit.id}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu đề thi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {examToEdit ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tên đề thi</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử THPT Môn Toán..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Mã đề thi</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="DRAFT">DRAFT (Bản nháp)</option>
                <option value="PUBLISHED">PUBLISHED (Xuất bản)</option>
              </select>
            </div>
          </div>

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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Khối lớp</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Chọn khối lớp --</option>
                {grades?.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Thời gian (Phút)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tổng điểm</label>
              <input
                type="number"
                step="0.5"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Điểm đạt</label>
              <input
                type="number"
                step="0.5"
                value={passPoints}
                onChange={(e) => setPassPoints(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả đề thi..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {examToEdit ? 'Lưu Cập Nhật' : 'Tạo Đề Thi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
