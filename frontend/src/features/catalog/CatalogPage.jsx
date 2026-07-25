import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ExamCard } from './ExamCard';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';

export const CatalogPage = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedSubject, selectedGrade, searchQuery]);

  const fetchCategories = async () => {
    try {
      const [resSub, resGrade] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/categories/grades')
      ]);
      setSubjects(resSub.data || []);
      setGrades(resGrade.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedGrade) params.gradeId = selectedGrade;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/catalog/exams', { params });
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-12 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Danh Mục Đề Thi Sinh Động
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Khám Phá Thư Viện <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Đề Thi Trắc Nghiệm</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Rèn luyện kỹ năng, ôn tập kiến thức môn học chuẩn hóa với tính năng tự động chấm điểm và đếm ngược thời gian realtime.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 glass-panel rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Tìm kiếm tên đề thi, mã đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Tất cả khối lớp</option>
            {grades.map((gr) => (
              <option key={gr.id} value={gr.id}>{gr.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Column Exam Grid Layout (4 columns on XL screens, 3 on LG, 2 on SM) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Chưa tìm thấy đề thi phù hợp</h3>
          <p className="text-xs text-slate-500">Vui lòng thử lại với từ khóa hoặc bộ lọc khác</p>
        </div>
      )}
    </div>
  );
};
