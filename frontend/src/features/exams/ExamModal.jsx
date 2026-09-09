import React, { useState, useEffect } from 'react';
import { X, Lock, Calendar, Shuffle, Eye, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ExamModal = ({ isOpen, onClose, examToEdit, subjects, grades, workspaceId, onSaveSuccess }) => {
  // ─── Thông tin cơ bản ───
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalPoints, setTotalPoints] = useState(10.0);
  const [passPoints, setPassPoints] = useState(5.0);
  const [status, setStatus] = useState('DRAFT');

  // ─── Phòng thi có kiểm soát ───
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [examPassword, setExamPassword] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showAnswerAfter, setShowAnswerAfter] = useState(false);
  const [proctorEnabled, setProctorEnabled] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ── Chuyển ISO UTC từ DB sang giờ local để hiển thị đúng trên input datetime-local ──
    // datetime-local input luôn đọc giờ theo múi giờ máy tính (local), KHÔNG phải UTC
    // Ví dụ: DB lưu "13:00 UTC" → cần hiển thị "20:00" (UTC+7)
    const toLocalInput = (isoStr) => {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      // Bù offset để toISOString trả về giờ local thay vì UTC
      const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    };

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
      // Controlled room fields — dùng toLocalInput để hiển thị đúng giờ Việt Nam
      setStartTime(toLocalInput(examToEdit.startTime));
      setEndTime(toLocalInput(examToEdit.endTime));
      setExamPassword(examToEdit.examPassword || '');
      setMaxAttempts(examToEdit.maxAttempts ?? 1);
      setShuffleQuestions(examToEdit.shuffleQuestions || false);
      setShuffleOptions(examToEdit.shuffleOptions || false);
      setShowAnswerAfter(examToEdit.showAnswerAfter || false);
      setProctorEnabled(examToEdit.proctorEnabled || false);
      // Mở advanced nếu đã có cấu hình
      if (examToEdit.startTime || examToEdit.endTime || examToEdit.examPassword || examToEdit.proctorEnabled) {
        setShowAdvanced(true);
      }
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
      setStartTime('');
      setEndTime('');
      setExamPassword('');
      setMaxAttempts(1);
      setShuffleQuestions(false);
      setShuffleOptions(false);
      setShowAnswerAfter(false);
      setProctorEnabled(false);
      setShowAdvanced(false);
    }
    setError('');
  }, [examToEdit, isOpen, subjects, grades]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Vui lòng nhập tiêu đề đề thi'); return; }
    if (!code.trim()) { setError('Vui lòng nhập mã đề thi'); return; }
    if (!subjectId || !gradeId) { setError('Vui lòng chọn môn học và khối lớp'); return; }
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      setError('Thời điểm kết thúc phải sau thời điểm bắt đầu');
      return;
    }

    // ── Chuyển datetime-local string (giờ local, không có TZ) sang UTC ISO string ──
    // Browser tự xử lý đúng: new Date("2026-08-27T20:00") = 20:00 local → .toISOString() = 13:00Z (UTC+7)
    const toUTCISO = (localStr) => localStr ? new Date(localStr).toISOString() : null;

    const payload = {
      title, code, description, subjectId, gradeId,
      durationMinutes: parseInt(durationMinutes, 10),
      totalPoints: parseFloat(totalPoints),
      passPoints: parseFloat(passPoints),
      status,
      startTime: toUTCISO(startTime),
      endTime: toUTCISO(endTime),
      examPassword: examPassword.trim() || null,
      maxAttempts: parseInt(maxAttempts, 10),
      shuffleQuestions,
      shuffleOptions,
      showAnswerAfter,
      proctorEnabled,
    };

    if (!examToEdit && workspaceId) {
      payload.workspaceId = workspaceId;
    }

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

  const inputClass = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors';
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide';

  const ToggleSwitch = ({ checked, onChange, id }) => (
    <button
      type="button"
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {examToEdit ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}
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

          {/* ─── Thông tin cơ bản ─── */}
          <div>
            <label className={labelClass}>Tên đề thi</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử THPT Môn Toán..." className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mã đề thi</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="DRAFT">DRAFT (Bản nháp)</option>
                <option value="PUBLISHED">PUBLISHED (Xuất bản)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Môn học</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}>
                <option value="">-- Chọn môn học --</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Khối lớp</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} className={inputClass}>
                <option value="">-- Chọn khối lớp --</option>
                {grades?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Thời gian (Phút)</label>
              <input type="number" min="5" max="360" value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tổng điểm</label>
              <input type="number" step="0.5" value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Điểm đạt</label>
              <input type="number" step="0.5" value={passPoints}
                onChange={(e) => setPassPoints(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Mô tả chi tiết</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả đề thi..." className={inputClass} />
          </div>

          {/* ─── Cấu hình phòng thi nâng cao ─── */}
          <div className="border border-slate-700/60 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Cấu hình phòng thi nâng cao
                {(startTime || endTime || examPassword || proctorEnabled) && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">ĐÃ CẤU HÌNH</span>
                )}
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 space-y-4">
                {/* Lịch thi */}
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" /> Lịch thi (để trống = không giới hạn)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Bắt đầu từ</label>
                      <input type="datetime-local" value={startTime}
                        onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Kết thúc lúc</label>
                      <input type="datetime-local" value={endTime}
                        onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Mật khẩu phòng thi (để trống = không cần)
                  </label>
                  <input type="text" value={examPassword} onChange={(e) => setExamPassword(e.target.value)}
                    placeholder="VD: ABC123 (giáo viên phát cho học sinh trước giờ thi)"
                    className={inputClass} />
                </div>

                {/* Số lần thi */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                    Giới hạn số lần thi (0 = không giới hạn)
                  </label>
                  <input type="number" min="0" max="99" value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)} className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'shuffleQ', label: 'Trộn thứ tự câu hỏi', icon: <Shuffle className="w-3.5 h-3.5 text-emerald-400" />, val: shuffleQuestions, set: setShuffleQuestions },
                    { id: 'shuffleO', label: 'Trộn thứ tự đáp án', icon: <Shuffle className="w-3.5 h-3.5 text-teal-400" />, val: shuffleOptions, set: setShuffleOptions },
                    { id: 'showAns', label: 'Cho xem đáp án sau thi', icon: <Eye className="w-3.5 h-3.5 text-cyan-400" />, val: showAnswerAfter, set: setShowAnswerAfter },
                    { id: 'proctor', label: 'Bật giám sát (Fullscreen)', icon: <Shield className="w-3.5 h-3.5 text-rose-400" />, val: proctorEnabled, set: setProctorEnabled },
                  ].map(({ id, label, icon, val, set }) => (
                    <div key={id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5">
                      <label htmlFor={id} className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
                        {icon} {label}
                      </label>
                      <ToggleSwitch id={id} checked={val} onChange={set} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={onClose}>Hủy</Button>
            <Button variant="primary" type="submit" loading={loading}>
              {examToEdit ? 'Lưu Cập Nhật' : 'Tạo Đề Thi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
