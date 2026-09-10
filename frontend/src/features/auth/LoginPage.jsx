/**
 * Trang đăng nhập: POST /auth/login, cookie do trình duyệt lưu (httpOnly).
 * Thành công: App nhận user qua onLoginSuccess, không lưu JWT.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GoogleLoginButton } from './GoogleLoginButton';
import api from '../../lib/axios';

export const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@elearning.com');
  const [password, setPassword] = useState('Student123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  /** Cookie đã set → lưu user vào App rồi về trang chủ. */
  const handleSuccess = (user) => {
    onLoginSuccess(user);
    navigate('/');
  };

  /** Gửi email + mật khẩu lên POST /auth/login. */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await api.post('/auth/login', { email, password });
      handleSuccess(res.data.user);
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setError(err.message);
        setInfo('Bạn có thể gửi lại email xác nhận bên dưới.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /** Gửi lại mail xác nhận khi API trả EMAIL_NOT_VERIFIED. */
  const handleResend = async () => {
    try {
      await api.post('/auth/resend-verification', { email });
      setInfo('Nếu tài khoản chưa xác nhận, hệ thống đã gửi lại email.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Hệ Thống E-Learning
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Đăng Nhập Tài Khoản</h2>
        <p className="text-xs text-slate-400">Nhập email và mật khẩu, hoặc dùng Google</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
          {error}
        </div>
      )}
      {info && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs text-center font-medium">
          {info}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="yourname@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Đang xử lý...' : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Đăng Nhập
            </span>
          )}
        </Button>
      </form>

      {error && info && (
        <button type="button" onClick={handleResend} className="w-full text-xs text-cyan-400 hover:underline">
          Gửi lại email xác nhận
        </button>
      )}

      <GoogleLoginButton onSuccess={handleSuccess} onError={setError} />

      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
