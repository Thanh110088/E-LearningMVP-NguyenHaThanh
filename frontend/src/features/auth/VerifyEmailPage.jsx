/**
 * User bấm link trong email → /verify-email?token=...
 * Trang đọc query, POST token lên API, nhận cookie, vào trang chủ.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../lib/axios';

export const VerifyEmailPage = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'Đang xác nhận email...' : 'Thiếu token xác nhận');

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    const run = async () => {
      try {
        const res = await api.post('/auth/verify-email', { token });
        if (cancelled) return;
        setStatus('success');
        setMessage('Email đã được xác nhận. Đang chuyển vào hệ thống...');
        onLoginSuccess?.(res.data.user);
        setTimeout(() => navigate('/'), 800);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.message || 'Xác nhận email thất bại');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, onLoginSuccess]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-2xl border border-slate-800 text-center space-y-4">
      {status === 'loading' && <Loader2 className="w-10 h-10 text-cyan-400 mx-auto animate-spin" />}
      {status === 'success' && <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />}
      {status === 'error' && <XCircle className="w-10 h-10 text-rose-400 mx-auto" />}
      <h2 className="text-xl font-bold text-slate-100">Xác nhận email</h2>
      <p className="text-sm text-slate-400">{message}</p>
      {status === 'error' && (
        <Link to="/login" className="text-sm text-indigo-400 hover:underline">
          Về trang đăng nhập
        </Link>
      )}
    </div>
  );
};
