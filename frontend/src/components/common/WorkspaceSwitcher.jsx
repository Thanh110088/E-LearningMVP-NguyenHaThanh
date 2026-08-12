import React, { useState, useRef, useEffect } from 'react';
import {
  FolderKanban,
  ChevronDown,
  Plus,
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
  Layers,
  Award,
  Lock,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  FolderKanban,
  BookOpen,
  GraduationCap,
  Laptop,
  Layers,
  Award,
};

export const WorkspaceSwitcher = () => {
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    switchWorkspace,
    setIsCreateModalOpen,
    usage,
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!workspaces || workspaces.length === 0) return null;

  const currentWs = activeWorkspace || workspaces[0];
  const CurrentIcon = (currentWs && ICON_MAP[currentWs.icon]) || FolderKanban;
  const currentColor = currentWs?.color || '#06b6d4';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 transition-all group shadow-sm"
        title="Đổi Workspace"
      >
        <div
          className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ backgroundColor: currentColor }}
        >
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-slate-200 max-w-[110px] sm:max-w-[140px] truncate group-hover:text-cyan-400 transition-colors">
          {currentWs?.name || 'Workspace'}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/50">
          {usage.total}/{usage.max}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Không gian làm việc
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Gói {usage.plan} ({usage.total}/{usage.max})
            </span>
          </div>

          {/* List of Workspaces */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
            {workspaces.map((ws) => {
              const WsIcon = ICON_MAP[ws.icon] || FolderKanban;
              const isActive = ws.id === activeWorkspaceId;
              const examCount = ws._count?.exams || 0;
              const questionCount = ws._count?.questions || 0;

              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
                      style={{ backgroundColor: ws.color || '#06b6d4' }}
                    >
                      <WsIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{ws.name}</span>
                        {ws.isDefault && (
                          <span className="text-[9px] font-medium text-slate-400 bg-slate-800 px-1 rounded">
                            Chính
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {examCount} đề thi • {questionCount} câu hỏi
                      </span>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="p-2 bg-slate-950/80 border-t border-slate-800/80 space-y-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-dashed border-cyan-500/30 hover:border-cyan-500/60"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Tạo Workspace Mới</span>
              </div>
              {usage.total >= usage.max && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {usage.plan === 'FREE' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/pricing');
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 text-xs font-bold text-amber-300 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 rounded-xl transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nâng cấp PRO để sở hữu 5 Workspaces</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
