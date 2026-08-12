import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, Flame, BookOpen, Clock, HelpCircle, User, Heart, ChevronDown, Check } from 'lucide-react';
import api from '../../lib/axios';

export const CatalogPage = () => {
  const [exams, setExams] = useState([]);
  const [popularExams, setPopularExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(''); // 'TIỂU HỌC', 'THCS', 'THPT'
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedSubject, selectedGradeId, sortBy, search]);

  const fetchMetadata = async () => {
    try {
      const [resSub, resGrd] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/categories/grades'),
      ]);
      const subList = Array.isArray(resSub.data?.data) ? resSub.data.data : Array.isArray(resSub.data) ? resSub.data : [];
      const grdList = Array.isArray(resGrd.data?.data) ? resGrd.data.data : Array.isArray(resGrd.data) ? resGrd.data : [];
      setSubjects(subList);
      setGrades(grdList);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedGradeId) params.gradeId = selectedGradeId;
      if (search) params.search = search;

      const res = await api.get('/catalog/exams', { params });
      const raw = res.data?.data?.items || res.data?.items || res.data || [];
      const items = Array.isArray(raw) ? raw : [];

      setExams(items);
      // Top 5 popular exams for right sidebar
      setPopularExams([...items].sort((a, b) => (b._count?.submissions || 0) - (a._count?.submissions || 0)).slice(0, 5));
    } catch (err) {
      console.error('Lỗi lấy danh sách đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSelectedSubject('');
    setSelectedGradeLevel('');
    setSelectedGradeId('');
    setSearch('');
    setSortBy('newest');
  };

  const getSubjectIconBg = (idx) => {
    const bgColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
    return bgColors[idx % bgColors.length];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Search Bar & Title Header (Khớp Hình 2) */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Thư viện đề thi ETech</h1>
          <p className="text-xs text-slate-400">Khám phá và tham gia các đề thi trắc nghiệm chất lượng cao</p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm đề thi, giáo viên..."
            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 pl-11 pr-4 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 3-Column Layout (Khớp Hình 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: Bộ Lọc (Khớp Hình 2) - 3 Columns */}
        <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-cyan-400" /> Bộ lọc
            </span>
            <button
              onClick={handleResetFilter}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Đặt lại
            </button>
          </div>

          {/* Môn học List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Môn học</span>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubject('')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !selectedSubject ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span>Tất cả môn học</span>
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id === selectedSubject ? '' : sub.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedSubject === sub.id
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({exams.filter(e => e.subjectId === sub.id).length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cấp học & Khối lớp Chips */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cấp học & Khối lớp</span>

            {/* THCS / THPT Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400">THPT</span>
              <div className="grid grid-cols-3 gap-1.5">
                {grades.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGradeId(g.id === selectedGradeId ? '' : g.id)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      selectedGradeId === g.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kiểu đề thi Accordion */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold cursor-pointer">
            <span>Kiểu đề thi</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          {/* Số câu hỏi Accordion */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold cursor-pointer">
            <span>Số câu hỏi</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* CENTER COLUMN: Thư viện đề thi (Khớp Hình 2) - 6 Columns */}
        <div className="lg:col-span-6 space-y-4">
          {/* Header Bar & Tabs */}
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-100">Thư viện đề thi</h2>
              <span className="text-xs text-slate-400 font-medium">{exams.length} đề thi</span>
            </div>

            {/* Tabs Sort */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-full border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1 rounded-full transition-all ${
                  sortBy === 'newest' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Mới nhất
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-full transition-all ${
                  sortBy === 'popular' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📈 Phổ biến
              </button>
            </div>
          </div>

          {/* Exam List Grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
              Đang tải danh sách đề thi...
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">Không tìm thấy đề thi nào</h3>
              <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc bên trái.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam, idx) => (
                <div
                  key={exam.id}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col sm:flex-row items-start gap-4 group"
                >
                  {/* Square Colored Icon Badge */}
                  <div className={`w-14 h-14 rounded-2xl ${getSubjectIconBg(idx)} text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                    <BookOpen className="w-7 h-7" />
                  </div>

                  {/* Exam Info */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Top Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {exam._count?.questions || 0} câu
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {exam.durationMinutes} phút
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono ml-auto">
                        {exam.code}
                      </span>
                    </div>

                    {/* Title */}
                    <Link to={`/exams/${exam.id}`} className="block">
                      <h3 className="text-base font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {exam.title}
                      </h3>
                    </Link>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span className="text-cyan-400">{exam.subject?.name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{exam.grade?.name}</span>
                    </div>

                    {/* Author & Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-medium">
                      <span>{exam.createdBy?.fullName || 'Giáo viên'}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-500" /> {exam._count?.submissions || 0} lượt</span>
                        <Link
                          to={`/exams/${exam.id}`}
                          className="px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30 text-xs transition-colors"
                        >
                          Vào Thi
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Đề thi phổ biến (Khớp Hình 2) - 3 Columns */}
        <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Đề thi phổ biến</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">Top 5 lượt làm nhiều nhất</span>

          <div className="space-y-3">
            {popularExams.map((ex, idx) => (
              <Link
                key={ex.id}
                to={`/exams/${ex.id}`}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-800/60 transition-all group"
              >
                {/* Rank Badge */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0
                      ? 'bg-amber-500 text-white'
                      : idx === 1
                      ? 'bg-slate-400 text-slate-950'
                      : idx === 2
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                    {ex.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {ex._count?.submissions || 0} lượt làm
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
