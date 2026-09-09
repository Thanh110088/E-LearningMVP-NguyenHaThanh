/** /reset-password?token= từ email → POST { token, newPassword }. */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-2xl border border-slate-800 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-100">Liên kết không hợp lệ</h2>
        <Link to="/forgot-password" className="text-sm text-indigo-400 hover:underline">
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Đặt lại mật khẩu</h2>
        <p className="text-xs text-slate-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
          {error}
        </div>
      )}

      {done ? (
        <p className="text-sm text-emerald-300 text-center">Đặt lại mật khẩu thành công. Đang chuyển tới đăng nhập...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mật khẩu mới"
            type="password"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            Cập nhật mật khẩu
          </Button>
        </form>
      )}
    </div>
  );
};
