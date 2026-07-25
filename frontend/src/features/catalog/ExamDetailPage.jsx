import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, Award, User, ArrowLeft, PlayCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ExamDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    try {
      const res = await api.get(`/catalog/exams/${id}`);
      setExam(res.data?.data || res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 animate-pulse">Đang tải thông tin đề thi...</div>;
  }

  if (error || !exam) {
    return (
      <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">{error || 'Không tìm thấy đề thi'}</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Danh Mục
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Trở Về Danh Mục
      </button>

      {/* Detail Banner Container */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{exam.subject?.name}</Badge>
          <Badge variant="neutral">{exam.grade?.name}</Badge>
          <Badge variant="success">Mã Đề: {exam.code}</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{exam.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">{exam.description || 'Không có mô tả chi tiết cho đề thi này.'}</p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Thời Gian</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <Clock className="w-4 h-4 text-indigo-400" /> {exam.durationMinutes} Phút
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Số Câu Hỏi</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <HelpCircle className="w-4 h-4 text-emerald-400" /> {exam._count?.questions || 0} Câu
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Tổng Điểm</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <Award className="w-4 h-4 text-amber-400" /> {exam.totalPoints} Đ
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Tạo Bởi</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <User className="w-4 h-4 text-violet-400" /> {exam.createdBy?.fullName || 'Giáo viên'}
            </div>
          </div>
        </div>

        {/* Start Exam CTA */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {user ? 'Sẵn sàng? Hệ thống sẽ bắt đầu đếm ngược ngay khi bạn ấn "Bắt Đầu Làm Bài".' : 'Vui lòng đăng nhập tài khoản Học sinh để làm bài.'}
          </div>
          {user ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/exams/${exam.id}/take`)}
            >
              <PlayCircle className="w-5 h-5 mr-2" /> Bắt Đầu Làm Bài
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={() => navigate('/login')}>
              Đăng Nhập Để Làm Bài
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
