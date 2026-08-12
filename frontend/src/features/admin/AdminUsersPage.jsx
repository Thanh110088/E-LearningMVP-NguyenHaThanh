import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Mail, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search, role: selectedRole } });
      setUsers(res.data?.data || res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi vai trò');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-1">
        <h1 className="text-2xl font-black text-white">Quản lý người dùng ETech</h1>
        <p className="text-xs text-slate-400 font-medium">Tìm kiếm, phân quyền vai trò (Admin / Giảng viên / Học sinh) và khóa/mở khóa tài khoản.</p>
      </div>

      {/* Main Table Card */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-200">Danh sách người dùng ({users.length} tài khoản)</h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên hoặc email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="STUDENT">Học sinh</option>
              <option value="TEACHER">Giảng viên</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Tên</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Vai trò</th>
                <th className="pb-3">Trạng thái</th>
                <th className="pb-3">Workspace</th>
                <th className="pb-3">Ngày tạo</th>
                <th className="pb-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 animate-pulse">Đang tải danh sách người dùng...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Không tìm thấy người dùng nào.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-100">{u.fullName}</td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : u.role === 'TEACHER'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {u.role === 'ADMIN' ? 'Admin' : u.role === 'TEACHER' ? 'Giảng viên' : 'Học sinh'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[11px] font-bold ${u.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{u.role === 'TEACHER' ? 'Workspace 1' : '—'}</td>
                    <td className="py-3.5 text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-bold px-2 py-1 text-slate-200"
                        >
                          <option value="STUDENT">Học sinh</option>
                          <option value="TEACHER">Giảng viên</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                          title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.isActive ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <a href={`mailto:${u.email}`} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400" title="Gửi email">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
