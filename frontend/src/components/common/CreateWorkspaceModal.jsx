import React, { useState } from 'react';
import { X, Sparkles, FolderKanban, Check, Lock, Layers, BookOpen, GraduationCap, Laptop, Award } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

const COLOR_OPTIONS = [
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
];

const ICON_OPTIONS = [
  { name: 'FolderKanban', icon: FolderKanban, label: 'Thư mục' },
  { name: 'BookOpen', icon: BookOpen, label: 'Môn học' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Lớp học' },
  { name: 'Laptop', icon: Laptop, label: 'Online' },
  { name: 'Layers', icon: Layers, label: 'Nhóm' },
  { name: 'Award', icon: Award, label: 'Luyện thi' },
];

export const CreateWorkspaceModal = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createWorkspace, usage, setIsUpgradeModalOpen } = useWorkspace();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [icon, setIcon] = useState('FolderKanban');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const isLimitReached = usage.total >= usage.max;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLimitReached) {
      setIsCreateModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!name.trim()) {
      setError('Vui lòng nhập tên Workspace');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace({ name, description, color, icon });
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Không thể tạo Workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tạo Workspace Mới</h3>
              <p className="text-xs text-slate-400">
                Sử dụng: <span className="font-bold text-cyan-400">{usage.total}/{usage.max}</span> Workspace (Gói {usage.plan})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Limit Warning Callout if limit reached */}
        {isLimitReached ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Đạt Giới Hạn Gói {usage.plan}</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Gói <span className="font-bold text-slate-200">{usage.plan}</span> của bạn chỉ hỗ trợ tối đa <span className="font-bold text-amber-400">{usage.max} Workspace</span>. Hãy nâng cấp gói <span className="font-bold text-cyan-400">PRO</span> để tạo tới 5 Workspaces!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  navigate('/pricing');
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Nâng Cấp PRO Ngay
              </button>
            </div>
          </div>
        ) : (
          /* Form for Workspace Creation */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tên Workspace <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Lớp Toán 10A1, Luyện thi THPTQG..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mô tả (Không bắt buộc)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="VD: Chứa ngân hàng câu hỏi & đề thi chuyên Toán 10"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Color Palette Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Màu đại diện
              </label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Biểu tượng
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo Workspace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
