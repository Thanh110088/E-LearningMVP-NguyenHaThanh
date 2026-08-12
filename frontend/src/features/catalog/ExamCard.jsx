import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, User, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const ExamCard = ({ exam, user }) => {
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card flex flex-col h-full border border-slate-800/80 transition-all duration-300">
      {/* Background Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={exam.thumbnailUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop'}
          alt={exam.title}
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="primary">{exam.subject?.name || 'Môn học'}</Badge>
            <Badge variant="neutral">{exam.grade?.name || 'Khối lớp'}</Badge>
          </div>
          {exam.isLive && (
            <Badge variant="danger" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {exam.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {exam.description || 'Chưa có mô tả cho đề thi này.'}
          </p>
        </div>

        {/* Exam Metadata Info */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> {exam.durationMinutes} phút
            </span>
            <span className="flex items-center gap-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" /> {exam._count?.questions || 0} câu
            </span>
          </div>

          {exam.createdBy && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <User className="w-3 h-3" /> {exam.createdBy.fullName}
            </span>
          )}
        </div>

        {/* Action Button Personalized */}
        <Link
          to={isTeacherOrAdmin ? '/manage-exams' : `/exams/${exam.id}`}
          className={`w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all group/btn ${
            isTeacherOrAdmin
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <span>{isTeacherOrAdmin ? 'Quản Lý Đề Thi' : 'Vào Thi Ngay'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
