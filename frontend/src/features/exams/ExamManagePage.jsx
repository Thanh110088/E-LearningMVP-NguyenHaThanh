import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit3, Trash2, CheckCircle2, Clock, Award, HelpCircle, Sparkles, Radio, Monitor, Calendar, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ExamModal } from './ExamModal';
import { AssignQuestionModal } from './AssignQuestionModal';
import { LiveHostDashboard } from '../live/LiveHostDashboard';
import { ExamMonitorPage } from './ExamMonitorPage';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../lib/axios';

export const ExamManagePage = ({ user }) => {
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignExam, setSelectedAssignExam] = useState(null);
  const [activeLiveExamId, setActiveLiveExamId] = useState(null);
  const [activeMonitorExamId, setActiveMonitorExamId] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [activeWorkspaceId]);

  if (activeLiveExamId) {
    return (
      <LiveHostDashboard
        examId={activeLiveExamId}
        onBack={() => setActiveLiveExamId(null)}
      />
    );
  }

  if (activeMonitorExamId) {
    return (
      <ExamMonitorPage
        examId={activeMonitorExamId}
        onBack={() => setActiveMonitorExamId(null)}
      />
    );
  }

  const fetchMetadata = async () => {
    try {
      const [resSub, resGrd] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/categories/grades'),
      ]);
      setSubjects(Array.isArray(resSub.data?.data) ? resSub.data.data : Array.isArray(resSub.data) ? resSub.data : []);
      setGrades(Array.isArray(resGrd.data?.data) ? resGrd.data.data : Array.isArray(resGrd.data) ? resGrd.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams/my-exams');
      setExams(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách đề thi của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setExamToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setExamToEdit(exam);
    setIsModalOpen(true);
  };

  const handleOpenAssign = (exam) => {
    setSelectedAssignExam(exam);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa đề thi');
    }
  };

  const handleToggleStatus = async (exam) => {
    const newStatus = exam.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.put(`/exams/${exam.id}`, { status: newStatus });
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Quản Lý Đề Thi</h1>
            <p className="text-sm text-slate-400">Tạo mới, chỉnh sửa, gán nhanh câu hỏi và xuất bản đề thi</p>
          </div>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tạo Đề Thi Mới
        </Button>
      </div>

      {/* Exam Table / List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium animate-pulse">
          Đang tải danh sách đề thi...
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Chưa có đề thi nào</h3>
          <p className="text-sm text-slate-500 mt-1">Bắt đầu bằng việc nhấn "Tạo Đề Thi Mới".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">{exam.code}</span>
                    <h3 className="text-lg font-bold text-slate-100 mt-0.5">{exam.title}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(exam)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 transition-colors ${exam.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                  >
                    {exam.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{exam.description || 'Không có mô tả'}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-400" /> {exam.durationMinutes} phút
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Award className="w-4 h-4 text-amber-400" /> {exam.totalPoints} điểm
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <HelpCircle className="w-4 h-4 text-violet-400" /> {exam._count?.questions || 0} câu hỏi
                  </div>
                  {exam.examPassword && (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Có mật khẩu
                    </span>
                  )}
                  {exam.startTime && (
                    <span className="flex items-center gap-1 text-sky-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> Có lịch thi
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60">
                <span className="text-xs text-slate-400 font-medium">
                  {exam.subject?.name} • {exam.grade?.name}
                </span>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => setActiveLiveExamId(exam.id)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition transform active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Thi Live
                  </button>
                  <button
                    onClick={() => setActiveMonitorExamId(exam.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Monitor className="w-3.5 h-3.5 text-emerald-400" /> Giám Sát
                  </button>
                  <Button variant="primary" size="sm" onClick={() => handleOpenAssign(exam)} className="text-xs font-bold px-2.5 py-1">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Gán Câu Hỏi
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(exam)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Sửa
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examToEdit={examToEdit}
        subjects={subjects}
        grades={grades}
        onSaveSuccess={fetchExams}
      />

      <AssignQuestionModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        exam={selectedAssignExam}
        onSaveSuccess={fetchExams}
      />
    </div>
  );
};
