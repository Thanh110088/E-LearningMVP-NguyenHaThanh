import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, KeyRound, PlayCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const LiveRoomPage = ({ user }) => {
  const navigate = useNavigate();
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (!pinCode.trim()) {
      setError('Vui lòng nhập mã PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/live/join', { pinCode });
      const exam = res.data?.data || res.data;
      navigate(`/exams/${exam.id}/take`);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã PIN không chính xác hoặc phòng thi chưa được mở');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 animate-pulse">
          <Radio className="w-4 h-4" /> Live Room PIN Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Tham Gia Phòng Thi Live</h1>
        <p className="text-sm text-slate-400">Nhập mã PIN gồm 6 ký tự do Giáo viên cung cấp để vào thi trực tiếp</p>
      </div>

      <form onSubmit={handleJoin} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase text-center">Nhập Mã PIN Phòng Thi</label>
          <div className="relative">
            <KeyRound className="w-6 h-6 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={10}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.toUpperCase())}
              placeholder="VD: 123456"
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 pl-14 pr-4 text-center font-mono text-2xl font-black tracking-widest text-indigo-400 uppercase focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <Button variant="primary" type="submit" size="lg" loading={loading} className="w-full text-base font-bold py-3.5">
          Vào Phòng Thi Ngay <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </div>
  );
};
