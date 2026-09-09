# 📂 HƯỚNG DẪN TỰ XÂY DỰNG TÍNH NĂNG KHÔNG GIAN LÀM VIỆC (MULTI-TENANT WORKSPACE & QUOTA)

> **Mục đích tài liệu:** Hướng dẫn từ A - Z cách thiết kế kiến trúc Không gian làm việc (Workspace) đa nhiệm cho Giáo viên/Tổ chức, phân lập dữ liệu (Đề thi, Câu hỏi theo từng Workspace) và kiểm soát giới hạn gói cước SaaS (Free: 1, Pro: 5, Enterprise: Không giới hạn).

---

## 🏗️ 1. TỔNG QUAN KIẾN TRÚC WORKSPACE

Mô hình Workspace cho phép 1 tài khoản Giáo viên có thể quản lý nhiều lớp học hoặc môn học độc lập:

```
                          ┌──────────────────────────┐
                          │   TÀI KHOẢN GIÁO VIÊN    │
                          │ (User: teacher@demo.com) │
                          │     Gói cước: PRO (5 WS) │
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │    WORKSPACE 1    │      │    WORKSPACE 2    │      │    WORKSPACE 3    │
   │  "Toán Học 12A1"  │      │  "Luyện Thi THPT" │      │  "Bồi Dưỡng HSG"  │
   │  Icon: BookOpen   │      │  Icon: Laptop     │      │  Icon: Award      │
   │  Color: #06b6d4   │      │  Color: #8b5cf6   │      │  Color: #ec4899   │
   ├───────────────────┤      ├───────────────────┤      ├───────────────────┤
   │ 📁 12 Đề thi      │      │ 📁 45 Đề thi      │      │ 📁 8 Đề thi       │
   │ ❓ 350 Câu hỏi    │      │ ❓ 1200 Câu hỏi   │      │ ❓ 180 Câu hỏi    │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

---

## 💾 2. THIẾT KẾ DATABASE PRISMA (`schema.prisma`)

```prisma
// ─── MODEL WORKSPACE ───
model Workspace {
  id          String   @id @default(uuid())
  name        String   // Tên Workspace (VD: Lớp 10A1 Toán)
  description String?  // Mô tả ngắn
  color       String   @default("#06b6d4") // Mã màu nhận diện Hex
  icon        String   @default("FolderKanban") // Tên Icon Lucide
  isDefault   Boolean  @default(false) // Đánh dấu Workspace mặc định khi tạo tài khoản
  userId      String   // Thuộc về User (Giáo viên) nào
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  exams       Exam[]     // Danh sách đề thi thuộc Workspace này
  questions   Question[] // Danh sách câu hỏi thuộc Workspace này

  @@map("workspaces")
}

// ─── LIÊN KẾT TRONG MODEL USER ───
model User {
  id          String      @id @default(uuid())
  email       String      @unique
  plan        UserPlan    @default(FREE) // FREE | PRO | ENTERPRISE
  workspaces  Workspace[]
  // ...
}

// ─── LIÊN KẾT TRONG MODEL EXAM & QUESTION ───
model Exam {
  id          String     @id @default(uuid())
  title       String
  workspaceId String?    // Khóa ngoại Workspace
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
  // ...
}

model Question {
  id          String     @id @default(uuid())
  content     String
  workspaceId String?    // Khóa ngoại Workspace
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
  // ...
}
```

---

## ⚙️ 3. BACKEND: SERVICE KIỂM SOÁT HẠN MỨC GÓI CƯỚC (QUOTA ENFORCEMENT)

```javascript
// backend/src/modules/workspace/workspace.service.js
const prisma = require('../../config/prisma');

// Định nghĩa hạn mức số lượng Workspace theo gói dịch vụ SaaS
const PLAN_LIMITS = {
  FREE: 1,
  PRO: 5,
  ENTERPRISE: 999999, // Không giới hạn
};

class WorkspaceService {
  // 1. Lấy danh sách Workspace của User (Nếu chưa có thì tự động tạo Default Workspace)
  async getMyWorkspaces(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Không tìm thấy người dùng');

    let workspaces = await prisma.workspace.findMany({
      where: { userId },
      include: {
        _count: { select: { exams: true, questions: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    // Tự động khởi tạo Workspace đầu tiên cho Giáo viên mới đăng ký
    if (workspaces.length === 0) {
      const defaultWs = await prisma.workspace.create({
        data: {
          userId,
          name: 'Workspace Mặc Định',
          description: 'Không gian làm việc chính của bạn',
          color: '#06b6d4',
          icon: 'FolderKanban',
          isDefault: true,
        },
        include: {
          _count: { select: { exams: true, questions: true } },
        },
      });
      workspaces = [defaultWs];
    }

    const plan = user.plan || 'FREE';
    const maxWorkspaces = PLAN_LIMITS[plan] || 1;

    return {
      workspaces,
      usage: {
        total: workspaces.length,
        max: maxWorkspaces,
        plan,
        canCreate: workspaces.length < maxWorkspaces,
      },
    };
  }

  // 2. Tạo Workspace mới (Bắt buộc kiểm tra hạn mức)
  async createWorkspace(userId, { name, description, color, icon }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const count = await prisma.workspace.count({ where: { userId } });
    
    const plan = user.plan || 'FREE';
    const limit = PLAN_LIMITS[plan] || 1;

    if (count >= limit) {
      const error = new Error(`Gói ${plan} của bạn chỉ cho phép tối đa ${limit} Workspace. Hãy nâng cấp gói PRO để mở rộng.`);
      error.statusCode = 403;
      throw error;
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#06b6d4',
        icon: icon || 'FolderKanban',
        isDefault: false,
      },
      include: {
        _count: { select: { exams: true, questions: true } },
      },
    });

    return newWorkspace;
  }

  // 3. Cập nhật Workspace
  async updateWorkspace(userId, workspaceId, data) {
    const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId } });
    if (!ws) throw new Error('Không tìm thấy Workspace hoặc bạn không có quyền');

    return prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: data.name?.trim() || ws.name,
        description: data.description !== undefined ? data.description?.trim() : ws.description,
        color: data.color || ws.color,
        icon: data.icon || ws.icon,
      },
      include: { _count: { select: { exams: true, questions: true } } },
    });
  }

  // 4. Xóa Workspace (Không cho xóa Default Workspace nếu là cái duy nhất)
  async deleteWorkspace(userId, workspaceId) {
    const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId } });
    if (!ws) throw new Error('Không tìm thấy Workspace');

    const total = await prisma.workspace.count({ where: { userId } });
    if (total <= 1) {
      throw new Error('Bạn không thể xóa Không gian làm việc duy nhất còn lại.');
    }

    return prisma.workspace.delete({ where: { id: workspaceId } });
  }
}

module.exports = new WorkspaceService();
```

---

## 🌐 4. FRONTEND: CONTEXT QUẢN LÝ TRẠNG THÁI (`WorkspaceContext.jsx`)

Context giúp toàn bộ ứng dụng biết được Giáo viên đang đứng ở Workspace nào và tự động lưu lựa chọn vào `localStorage`:

```jsx
// frontend/src/context/WorkspaceContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ user, children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('etech_active_workspace_id') || null;
  });
  const [usage, setUsage] = useState({ total: 1, max: 1, plan: 'FREE', canCreate: false });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách Workspace từ API
  const fetchWorkspaces = useCallback(async () => {
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) return;
    setLoading(true);
    try {
      const res = await api.get('/workspaces');
      const data = res.data?.data || res.data || {};
      const wsList = data.workspaces || [];
      setWorkspaces(wsList);
      setUsage(data.usage || { total: wsList.length, max: 1, plan: user.plan || 'FREE' });

      // Nếu chưa có ID nào được chọn hoặc ID cũ bị xóa, chọn cái đầu tiên
      if (!activeWorkspaceId || !wsList.some(w => w.id === activeWorkspaceId)) {
        const defaultId = wsList[0]?.id || null;
        setActiveWorkspaceId(defaultId);
        if (defaultId) localStorage.setItem('etech_active_workspace_id', defaultId);
      }
    } catch (err) {
      console.error('Lỗi tải Workspaces:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeWorkspaceId]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Chuyển đổi Workspace
  const switchWorkspace = (id) => {
    setActiveWorkspaceId(id);
    localStorage.setItem('etech_active_workspace_id', id);
  };

  // Tạo Workspace mới
  const createWorkspace = async ({ name, description, color, icon }) => {
    const res = await api.post('/workspaces', { name, description, color, icon });
    const newWs = res.data?.data || res.data;
    await fetchWorkspaces();
    switchWorkspace(newWs.id);
    setIsCreateModalOpen(false);
    return newWs;
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        switchWorkspace,
        createWorkspace,
        fetchWorkspaces,
        usage,
        isCreateModalOpen,
        setIsCreateModalOpen,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
```

---

## 🎨 5. FRONTEND: BỘ CHỌN WORKSPACE TRÊN HEADER (`WorkspaceSwitcher.jsx`)

Component hiển thị Dropdown chuyển Workspace cực kỳ mượt mà:

```jsx
// frontend/src/components/common/WorkspaceSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FolderKanban, ChevronDown, Plus, Check, BookOpen, GraduationCap, Laptop, Layers, Award } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const ICON_MAP = { FolderKanban, BookOpen, GraduationCap, Laptop, Layers, Award };

export const WorkspaceSwitcher = () => {
  const { workspaces, activeWorkspace, activeWorkspaceId, switchWorkspace, setIsCreateModalOpen, usage } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!workspaces || workspaces.length === 0) return null;

  const currentWs = activeWorkspace || workspaces[0];
  const CurrentIcon = ICON_MAP[currentWs?.icon] || FolderKanban;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút kích hoạt Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-bold transition"
      >
        <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: currentWs?.color || '#06b6d4' }}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="max-w-[130px] truncate">{currentWs?.name}</span>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
          {usage.total}/{usage.max}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between">
            <span>Không gian làm việc</span>
            <span className="text-cyan-400">Gói {usage.plan}</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
            {workspaces.map((ws) => {
              const WsIcon = ICON_MAP[ws.icon] || FolderKanban;
              const isSelected = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  onClick={() => { switchWorkspace(ws.id); setIsOpen(false); }}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                    isSelected ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: ws.color }}>
                      <WsIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{ws.name}</p>
                      <p className="text-[10px] text-slate-500">{ws._count?.exams || 0} đề thi • {ws._count?.questions || 0} câu hỏi</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Nút Tạo Workspace Mới */}
          <button
            onClick={() => { setIsOpen(false); setIsCreateModalOpen(true); }}
            className="w-full p-2.5 mt-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo Không Gian Mới
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔗 6. CÁCH LỌC ĐỀ THI & CÂU HỎI THEO WORKSPACE ĐANG CHỌN

Mỗi khi người dùng chuyển Workspace (`activeWorkspaceId`), các trang Quản lý chỉ cần truyền tham số `workspaceId` vào API:

```javascript
// 1. Lọc danh sách đề thi theo Workspace:
const fetchExams = async () => {
  const res = await api.get('/exams/my-exams', {
    params: { workspaceId: activeWorkspaceId }
  });
  setExams(res.data);
};

// 2. Gán đề thi mới vào Workspace hiện tại:
const handleCreateExam = async (examData) => {
  await api.post('/exams', {
    ...examData,
    workspaceId: activeWorkspaceId, // Tự động gắn ID Workspace
  });
};
```
