import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Trash2, Plus } from 'lucide-react';
import api from '../../lib/axios';

export const AdminSubjectsPage = () => {
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'grades'
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Subject
  const [name, setName] = useState('');
  const [subCode, setSubCode] = useState('');
  
  // Form Grade
  const [gradeName, setGradeName] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resGrade] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/categories/grades'),
      ]);
      setSubjects(Array.isArray(resSub.data?.data) ? resSub.data.data : Array.isArray(resSub.data) ? resSub.data : []);
      setGrades(Array.isArray(resGrade.data?.data) ? resGrade.data.data : Array.isArray(resGrade.data) ? resGrade.data : []);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên môn học');
      return;
    }
    setError('');
    setCreating(true);
    try {
      const code = subCode.trim() || ('SUB_' + name.trim().toUpperCase().replace(/\s+/g, '_'));
      await api.post('/categories/subjects', { name: name.trim(), code });
      setName('');
      setSubCode('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo môn học');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa môn học này?')) return;
    try {
      await api.delete(`/categories/subjects/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa môn học');
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    if (!gradeName.trim()) {
      setError('Vui lòng nhập tên khối lớp');
      return;
    }
    setError('');
    setCreating(true);
    try {
      const code = gradeCode.trim() || ('GRADE_' + gradeName.trim().toUpperCase().replace(/\s+/g, '_'));
      await api.post('/categories/grades', { name: gradeName.trim(), code, level: Number(gradeLevel) || 10 });
      setGradeName('');
      setGradeCode('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo khối lớp');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGrade = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khối lớp này?')) return;
    try {
      await api.delete(`/categories/grades/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa khối lớp');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white">Quản lý Môn học & Khối lớp ETech</h1>
          <p className="text-xs text-slate-400 font-medium">Thêm, sửa, xóa danh mục môn học và khối lớp dùng chung cho toàn hệ thống</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('subjects'); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'subjects'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Môn học ({subjects.length})
          </button>
          <button
            onClick={() => { setActiveTab('grades'); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'grades'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Khối lớp ({grades.length})
          </button>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Table List (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {activeTab === 'subjects' ? 'Danh sách môn học' : 'Danh sách khối lớp'}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {activeTab === 'subjects' ? `${subjects.length} môn học` : `${grades.length} khối lớp`} trong hệ thống
            </span>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'subjects' ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Mã Code</th>
                    <th className="pb-3">Tên môn học</th>
                    <th className="pb-3">Số đề thi</th>
                    <th className="pb-3">Ngày tạo</th>
                    <th className="pb-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 animate-pulse">Đang tải môn học...</td>
                    </tr>
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Chưa có môn học nào.</td>
                    </tr>
                  ) : (
                    subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 text-slate-400 font-mono text-[11px]">{sub.code}</td>
                        <td className="py-3.5 font-bold text-slate-100">{sub.name}</td>
                        <td className="py-3.5 font-bold text-cyan-400">{sub._count?.exams || 0}</td>
                        <td className="py-3.5 text-slate-400 text-[11px]">{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleDeleteSubject(sub.id)} className="p-1 rounded-lg hover:bg-slate-800 text-rose-400" title="Xóa">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Mã Code</th>
                    <th className="pb-3">Tên khối lớp</th>
                    <th className="pb-3">Cấp độ (Level)</th>
                    <th className="pb-3">Số đề thi</th>
                    <th className="pb-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 animate-pulse">Đang tải khối lớp...</td>
                    </tr>
                  ) : grades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Chưa có khối lớp nào.</td>
                    </tr>
                  ) : (
                    grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 text-slate-400 font-mono text-[11px]">{grade.code}</td>
                        <td className="py-3.5 font-bold text-slate-100">{grade.name}</td>
                        <td className="py-3.5 font-bold text-amber-400">Lớp {grade.level}</td>
                        <td className="py-3.5 font-bold text-cyan-400">{grade._count?.exams || 0}</td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleDeleteGrade(grade.id)} className="p-1 rounded-lg hover:bg-slate-800 text-rose-400" title="Xóa">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Form Tạo Mới (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
          {activeTab === 'subjects' ? (
            <>
              <div>
                <h3 className="text-base font-bold text-white">Tạo môn học mới</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Nhập tên môn học để tạo mới danh mục môn học.</p>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Tên môn học</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Toán học"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Mã môn (tùy chọn)</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="Ví dụ: MATH (tự động tạo nếu để trống)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" /> Tạo môn học
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-white">Tạo khối lớp mới</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Nhập thông tin tên và cấp độ khối lớp cần tạo.</p>
              </div>

              <form onSubmit={handleCreateGrade} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Tên khối lớp</label>
                  <input
                    type="text"
                    value={gradeName}
                    onChange={(e) => setGradeName(e.target.value)}
                    placeholder="Ví dụ: Lớp 10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Mã khối (tùy chọn)</label>
                  <input
                    type="text"
                    value={gradeCode}
                    onChange={(e) => setGradeCode(e.target.value)}
                    placeholder="Ví dụ: G10 (tự động tạo nếu để trống)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Cấp độ (Level)</label>
                  <input
                    type="number"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="Ví dụ: 10"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" /> Tạo khối lớp
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
