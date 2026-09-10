/** POST /auth/forgot-password. API luôn 200 — không nói email có tồn tại hay không. */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  /** POST /auth/forgot-password — luôn hiện thành công, không lộ email có tồn tại. */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Quên mật khẩu</h2>
        <p className="text-xs text-slate-400">Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
          {error}
        </div>
      )}

      {done ? (
        <p className="text-sm text-cyan-300 text-center">
          Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm tra hộp thư.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" /> Gửi liên kết
            </span>
          </Button>
        </form>
      )}

      <div className="text-center text-xs text-slate-400">
        <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};
