import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const RegisterPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', { fullName, email, password, role });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      onLoginSuccess(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-2xl shadow-2xl border border-slate-800 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Tạo Tài Khoản Mới
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Đăng Ký Tham Gia</h2>
        <p className="text-xs text-slate-400">Trải nghiệm hệ thống thi trắc nghiệm hiện đại</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và Tên"
          type="text"
          icon={User}
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Vai Trò</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-3 rounded-xl text-xs font-semibold border transition-all ${role === 'STUDENT' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
            >
              🎓 Học Sinh
            </button>
            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`p-3 rounded-xl text-xs font-semibold border transition-all ${role === 'TEACHER' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
            >
              👨‍🏫 Giáo Viên
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : (
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản
            </span>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};
