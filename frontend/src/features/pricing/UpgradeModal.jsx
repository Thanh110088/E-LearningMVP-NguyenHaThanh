import React, { useState } from 'react';
import { X, Check, Sparkles, QrCode, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export const UpgradeModal = ({ isOpen, onClose, selectedPlan = 'PRO', onUpgradeSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('QR_BANKING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const planPrice = selectedPlan === 'PRO' ? '99.000đ / tháng' : 'Liên hệ Sales';
  const amountNumber = selectedPlan === 'PRO' ? 99000 : 499000;

  const handleConfirmUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/subscription/upgrade', {
        plan: selectedPlan,
        paymentMethod,
      });

      const updatedUser = res.data?.data?.user || res.data?.user;
      onUpgradeSuccess(updatedUser);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể nâng cấp gói cước');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">Nâng Cấp Gói {selectedPlan}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Package Overview */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase">Gói Đã Chọn</span>
              <span className="text-sm font-black text-white">{selectedPlan}</span>
            </div>
            <p className="text-lg font-extrabold text-slate-100">{planPrice}</p>
            <span className="text-[11px] text-slate-400 block">Kích hoạt quyền lợi trọn gói trong 30 ngày. Gia hạn linh hoạt.</span>
          </div>

          {/* QR Code Transfer Simulation */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase">Phương Thức Thanh Toán</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('QR_BANKING')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'QR_BANKING'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Mã QR VietQR</span>
                  <span className="text-[10px] text-slate-400">Chuyển khoản 24/7</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MOMO')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'MOMO'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-pink-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Ví MoMo / ZaloPay</span>
                  <span className="text-[10px] text-slate-400">Quét mã tức thì</span>
                </div>
              </button>
            </div>

            {/* QR Mockup Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ETECH_${selectedPlan}_UPGRADE`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <p>Ngân hàng: <strong>MBBank</strong></p>
                <p>Số tài khoản: <strong className="text-cyan-400 font-bold">0987654321</strong></p>
                <p>Chủ tài khoản: <strong>ETECH EDUCATION TECHNOLOGY</strong></p>
                <p className="text-[11px] text-amber-400 font-semibold">Nội dung: ETECH {selectedPlan} UPGRADE</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kích hoạt tự động ngay sau khi xác nhận thanh toán.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmUpgrade}
            loading={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 font-bold border-0 px-6"
          >
            Xác Nhận Nâng Cấp Ngay <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
