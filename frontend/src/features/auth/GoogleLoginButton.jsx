/**
 * Nút Google Identity Services.
 * Google trả `credential` (JWT do Google ký) → backend verify, không nhận password.
 * Thiếu VITE_GOOGLE_CLIENT_ID thì component return null (ẩn nút).
 */
import React, { useEffect, useRef } from 'react';
import api from '../../lib/axios';

export const GoogleLoginButton = ({ onSuccess, onError }) => {
  const btnRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || !btnRef.current) return undefined;

    /** Google trả credential (idToken) → POST /auth/google. */
    const handleCredential = async (response) => {
      try {
        const res = await api.post('/auth/google', { idToken: response.credential });
        onSuccessRef.current?.(res.data.user);
      } catch (err) {
        onErrorRef.current?.(err.message || 'Đăng nhập Google thất bại');
      }
    };

    /** Khởi tạo GIS rồi vẽ nút Google vào btnRef. */
    const renderButton = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      btnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 336,
        text: 'continue_with',
        locale: 'vi',
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return undefined;
    }

    const existing = document.querySelector('script[data-google-gsi]');
    if (existing) {
      existing.addEventListener('load', renderButton);
      return () => existing.removeEventListener('load', renderButton);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = renderButton;
    document.body.appendChild(script);
    return undefined;
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="px-2 bg-[#0b1220] text-slate-500">Hoặc tiếp tục với</span>
        </div>
      </div>
      <div ref={btnRef} className="flex justify-center min-h-[40px]" />
    </div>
  );
};
