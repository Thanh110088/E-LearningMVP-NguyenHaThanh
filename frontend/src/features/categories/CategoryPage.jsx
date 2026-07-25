import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import api from '../../lib/axios';

export const CategoryPage = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [activeTab, setActiveTab] = useState('subjects');
  const [loading, setLoading] = useState(true);

  // Form states
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [level, setLevel] = useState(10);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resGrade] = await Promise.all([
        api.get('/categories/subjects'),
        api.get('/categories/grades')
      ]);
      setSubjects(resSub.data || []);
      setGrades(resGrade.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories/subjects', { name: subName, code: subCode });
      setSubName('');
      setSubCode('');
      setMsg('Đã thêm môn học thành công!');
      fetchData();
    } catch (err) {
      setMsg('Lỗi: ' + err.message);
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories/grades', { name: gradeName, code: gradeCode, level: Number(level) });
      setGradeName('');
      setGradeCode('');
      setMsg('Đã thêm khối lớp thành công!');
      fetchData();
    } catch (err) {
      setMsg('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" /> Quản Lý Môn Học & Khối Lớp
        </h1>
        <p className="text-xs text-slate-400">Danh mục chuẩn hóa hệ thống dùng cho việc phân loại đề thi & ngân hàng câu hỏi</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'subjects' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <BookOpen className="w-4 h-4" /> Danh Sách Môn Học ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'grades' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Layers className="w-4 h-4" /> Danh Sách Khối Lớp ({grades.length})
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          {msg}
        </div>
      )}

      {/* Admin Add Form */}
      {user?.role === 'ADMIN' && (
        <div className="p-6 glass-panel rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            {activeTab === 'subjects' ? 'Thêm Môn Học Mới (Admin)' : 'Thêm Khối Lớp Mới (Admin)'}
          </h3>

          {activeTab === 'subjects' ? (
            <form onSubmit={handleCreateSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <Input label="Tên Môn Học" placeholder="VD: Hóa Học" value={subName} onChange={(e) => setSubName(e.target.value)} required />
              <Input label="Mã Môn Học" placeholder="VD: CHEM" value={subCode} onChange={(e) => setSubCode(e.target.value)} required />
              <Button type="submit" variant="primary" size="md">Thêm Môn Học</Button>
            </form>
          ) : (
            <form onSubmit={handleCreateGrade} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <Input label="Tên Khối Lớp" placeholder="VD: Lớp 11" value={gradeName} onChange={(e) => setGradeName(e.target.value)} required />
              <Input label="Mã Khối Lớp" placeholder="VD: G11" value={gradeCode} onChange={(e) => setGradeCode(e.target.value)} required />
              <Input label="Cấp Độ" type="number" value={level} onChange={(e) => setLevel(e.target.value)} required />
              <Button type="submit" variant="primary" size="md">Thêm Khối Lớp</Button>
            </form>
          )}
        </div>
      )}

      {/* Tables Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Đang tải dữ liệu danh mục...</div>
      ) : activeTab === 'subjects' ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Mã Môn</th>
                <th className="p-4">Tên Môn Học</th>
                <th className="p-4">Số Lượng Đề Thi</th>
                <th className="p-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-indigo-400">{sub.code}</td>
                  <td className="p-4 font-semibold text-slate-200">{sub.name}</td>
                  <td className="p-4 text-slate-400">{sub._count?.exams || 0} bài thi</td>
                  <td className="p-4 text-right">
                    <Badge variant="success">Hoạt động</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Mã Khối</th>
                <th className="p-4">Tên Khối Lớp</th>
                <th className="p-4">Level</th>
                <th className="p-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {grades.map((gr) => (
                <tr key={gr.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-indigo-400">{gr.code}</td>
                  <td className="p-4 font-semibold text-slate-200">{gr.name}</td>
                  <td className="p-4 text-slate-400">Level {gr.level}</td>
                  <td className="p-4 text-right">
                    <Badge variant="success">Hoạt động</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
