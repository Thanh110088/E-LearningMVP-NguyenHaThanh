import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield, Mail, ArrowRight, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { UpgradeModal } from './UpgradeModal';

export const PricingPage = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState('PRO');

  const handleOpenUpgrade = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlanToUpgrade(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeSuccess = (updatedUser) => {
    if (onUserUpdate) {
      onUserUpdate({ ...user, plan: updatedUser.plan, planExpiresAt: updatedUser.planExpiresAt });
    }
    alert(`Chúc mừng! Bạn đã nâng cấp thành công lên gói ${updatedUser.plan}!`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Header Section (Khớp Hình 3) */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" /> BẢNG GIÁ MINH BẠCH
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Chọn gói phù hợp với{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            nhu cầu của bạn
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Từ lớp nhỏ đến hệ thống trường học — mở rộng khi bạn sẵn sàng. Không phí ẩn, không ràng buộc dài hạn với gói Free.
        </p>
      </div>

      {/* 3 Pricing Cards (Khớp Hình 3) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Card 1: Free */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Free</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-slate-100">0đ</span>
                <span className="text-xs text-slate-400 font-medium">/ miễn phí mãi mãi</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Giáo viên cá nhân mới bắt đầu, lớp nhỏ hoặc thử nghiệm nền tảng.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> 10 đề thi</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> 200 câu hỏi</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> 1 workspace</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Phòng live tối đa 30 học sinh</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Import đề từ Word</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Xuất điểm Excel</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Báo cáo cơ bản</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Watermark khi in đề</div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-2xl border-slate-700 hover:bg-slate-800 text-slate-200 font-bold py-3 text-xs"
            onClick={() => navigate(user ? '/manage-exams' : '/register')}
          >
            {user?.plan === 'FREE' ? 'Đang Sử Dụng' : 'Vào Dashboard'}
          </Button>
        </div>

        {/* Card 2: Pro (Đề Xuất - Cyan Highlight) */}
        <div className="relative bg-slate-900 border-2 border-cyan-500 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-cyan-500/10 hover:border-cyan-400 transition-all scale-105">
          {/* Badge Đề xuất */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md">
            Đề xuất
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-cyan-400">Pro</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-slate-100">99.000đ</span>
                <span className="text-xs text-slate-400 font-medium">/ tháng</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Giáo viên chuyên nghiệp, trung tâm nhỏ cần công cụ đầy đủ và báo cáo sâu.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-2 text-cyan-400 font-bold"><Check className="w-4 h-4 shrink-0" /> 100 đề thi</div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold"><Check className="w-4 h-4 shrink-0" /> 5.000 câu hỏi</div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold"><Check className="w-4 h-4 shrink-0" /> 5 workspace</div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold"><Check className="w-4 h-4 shrink-0" /> Phòng live tối đa 100 học sinh</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Import đề từ Word</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Xuất điểm Excel</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Báo cáo & phân tích nâng cao</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> In đề không watermark</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Nhiều workspace cho nhiều lớp</div>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 font-extrabold py-3 text-xs shadow-lg shadow-cyan-500/25 border-0 text-white"
            onClick={() => handleOpenUpgrade('PRO')}
          >
            {user?.plan === 'PRO' ? 'Gói Đang Sử Dụng' : 'Nâng Cấp Ngay Pro'}
          </Button>
        </div>

        {/* Card 3: Enterprise */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Enterprise</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-100">Liên hệ</span>
                <span className="text-xs text-slate-400 font-medium">/ theo quy mô tổ chức</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Trường học, sở/phòng và chuỗi trung tâm cần quy mô lớn & hỗ trợ riêng.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Không giới hạn đề thi</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Không giới hạn câu hỏi</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Không giới hạn workspace</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Phòng live tối đa 500 học sinh</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Import đề từ Word</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Xuất điểm Excel</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Báo cáo & phân tích nâng cao</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> In đề không watermark</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Hỗ trợ triển khai & SLA riêng</div>
              <div className="flex items-center gap-2 text-cyan-400"><Check className="w-4 h-4 shrink-0" /> Tùy chỉnh theo tổ chức</div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-2xl border-slate-700 hover:bg-slate-800 text-slate-200 font-bold py-3 text-xs"
            onClick={() => handleOpenUpgrade('ENTERPRISE')}
          >
            Liên Hệ Sales
          </Button>
        </div>
      </div>

      {/* Comparison Table Section (Khớp Hình 3) */}
      <div className="max-w-5xl mx-auto space-y-6 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">So sánh chi tiết các gói</h2>
          <p className="text-xs text-slate-400">Tất cả tính năng cốt lõi — khác biệt ở quy mô và công cụ nâng cao.</p>
        </div>

        <div className="overflow-x-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-4 font-semibold">Tính năng</th>
                <th className="pb-4 font-semibold text-center">Free</th>
                <th className="pb-4 font-semibold text-center text-cyan-400">Pro</th>
                <th className="pb-4 font-semibold text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              <tr>
                <td className="py-3.5 font-bold">Số đề thi</td>
                <td className="py-3.5 text-center">10</td>
                <td className="py-3.5 text-center font-bold text-cyan-400">100</td>
                <td className="py-3.5 text-center">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Ngân hàng câu hỏi</td>
                <td className="py-3.5 text-center">200</td>
                <td className="py-3.5 text-center font-bold text-cyan-400">5.000</td>
                <td className="py-3.5 text-center">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Workspace</td>
                <td className="py-3.5 text-center">1</td>
                <td className="py-3.5 text-center font-bold text-cyan-400">5</td>
                <td className="py-3.5 text-center">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Phòng thi live</td>
                <td className="py-3.5 text-center">30 HS</td>
                <td className="py-3.5 text-center font-bold text-cyan-400">100 HS</td>
                <td className="py-3.5 text-center">500 HS</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Import Word</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Xuất Excel</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
                <td className="py-3.5 text-center text-emerald-400">Có</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Báo cáo nâng cao</td>
                <td className="py-3.5 text-center text-slate-500">Không</td>
                <td className="py-3.5 text-center text-emerald-400 font-bold">Có</td>
                <td className="py-3.5 text-center text-emerald-400 font-bold">Có</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Watermark in ấn</td>
                <td className="py-3.5 text-center text-slate-400">Có</td>
                <td className="py-3.5 text-center text-slate-500 font-bold">Không</td>
                <td className="py-3.5 text-center text-slate-500 font-bold">Không</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold">Hỗ trợ</td>
                <td className="py-3.5 text-center">Cộng đồng</td>
                <td className="py-3.5 text-center font-bold text-cyan-400">Email ưu tiên</td>
                <td className="py-3.5 text-center">Dedicated & SLA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Contact Box (Khớp Hình 3) */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Cần tư vấn thêm?</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          Đội ngũ ETech sẵn sàng hỗ trợ chọn gói, demo tính năng Pro/Enterprise và triển khai cho trường học hoặc trung tâm của bạn.
        </p>

        <a
          href="mailto:codefarmvn@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Mail className="w-4 h-4" /> Liên hệ hỗ trợ (codefarmvn@gmail.com)
        </a>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        selectedPlan={selectedPlanToUpgrade}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};
