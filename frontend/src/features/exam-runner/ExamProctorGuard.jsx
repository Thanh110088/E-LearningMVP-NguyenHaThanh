import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Maximize2, AlertOctagon, ShieldCheck } from 'lucide-react';

/**
 * ExamProctorGuard
 * 1. Proctoring status banner with one-click Fullscreen toggle.
 * 2. Active Anti-Cheat: Blocks Right-click, Copy, Cut, Paste, Text Selection, and DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U, PrintScreen).
 * 3. Tab switch & window blur detection.
 * 4. Toast notifications on any suspicious activity without blocking the question view.
 */
export const ExamProctorGuard = ({
  children,
  proctorEnabled = false,
  onViolation,
  violationCount = 0,
  isFullscreen = false,
  onRequestFullscreen,
}) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // ── Global Anti-Cheat Event Handlers (Capture Phase) ──
  useEffect(() => {
    // 1. Block Context Menu (Right-Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast('⚠️ Chuột phải đã bị vô hiệu hóa trong phòng thi!');
      onViolation?.('RIGHT_CLICK');
      return false;
    };

    // 2. Block Copy, Cut, Paste
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast('⚠️ Hành vi Copy bị nghiêm cấm trong phòng thi!');
      onViolation?.('COPY_ATTEMPT');
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast('⚠️ Hành vi Cut bị nghiêm cấm trong phòng thi!');
      onViolation?.('CUT_ATTEMPT');
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showToast('⚠️ Hành vi Paste bị nghiêm cấm trong phòng thi!');
      onViolation?.('PASTE_ATTEMPT');
      return false;
    };

    // 3. Block DevTools & Inspection shortcuts
    const handleKeyDown = (e) => {
      const isDevTools =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U'].includes(e.key)) ||
        e.key === 'PrintScreen';

      if (isDevTools) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Phím tắt DevTools / In trang bị vô hiệu hóa!');
        onViolation?.('DEV_TOOLS_ATTEMPT');
        return false;
      }
    };

    // 4. Detect Tab switch (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        showToast('⚠️ Cảnh báo: Rời phòng thi / chuyển tab đã bị ghi nhận!');
        onViolation?.('TAB_SWITCH');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('cut', handleCut, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('cut', handleCut, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onViolation, showToast]);

  return (
    <div className="relative min-h-screen select-none">
      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div className="bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-400 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Proctoring Active Floating Top Banner ── */}
      {proctorEnabled && (
        <div className="mb-4">
          {!isFullscreen ? (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-2 border-amber-500/60 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold text-amber-300">
                    🛡️ Đề thi có Giám Sát: Vui lòng bật Toàn Màn Hình
                  </p>
                  <p className="text-xs text-slate-300">
                    Hệ thống sẽ ghi nhận vi phạm nếu bạn rời khỏi màn hình hoặc chuyển tab.
                  </p>
                </div>
              </div>
              <button
                onClick={onRequestFullscreen}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition transform active:scale-95 shrink-0"
              >
                <Maximize2 className="w-4 h-4" /> BẬT TOÀN MÀN HÌNH
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>🛡️ Đang ở chế độ Toàn Màn Hình an toàn • Giám sát chống gian lận đang hoạt động</span>
              </div>
              {violationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  {violationCount} vi phạm
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
