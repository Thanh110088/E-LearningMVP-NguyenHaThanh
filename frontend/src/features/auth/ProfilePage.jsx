/** Đổi mật khẩu khi đã login: POST /auth/change-password — server gửi email cảnh báo. */
import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ProfilePage = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Đổi mật khẩu thành công. Hệ thống đã gửi email cảnh báo bảo mật.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 space-y-6">
      <div className="p-6 glass-panel rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-slate-100">Tài khoản</h1>
        <p className="text-sm text-slate-400 mt-1">{user?.fullName} · {user?.email}</p>
        <p className="text-xs text-slate-500 mt-2">
          Đăng nhập: {user?.provider === 'GOOGLE' ? 'Google' : 'Email/mật khẩu'}
          {user?.emailVerified ? ' · Email đã xác nhận' : ' · Email chưa xác nhận'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 glass-panel rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Đổi mật khẩu
        </div>
        <p className="text-xs text-slate-400">
          Khi mật khẩu được thay đổi, hệ thống gửi email xác nhận tới {user?.email}.
        </p>
        {error && <div className="text-xs text-rose-400">{error}</div>}
        {success && <div className="text-xs text-emerald-400">{success}</div>}
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          icon={Lock}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          icon={Lock}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" disabled={loading}>
          Cập nhật mật khẩu
        </Button>
      </form>
    </div>
  );
};
