import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/common/Layout';
import { HomePage } from './features/home/HomePage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { ExamDetailPage } from './features/catalog/ExamDetailPage';
import { PricingPage } from './features/pricing/PricingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { CategoryPage } from './features/categories/CategoryPage';
import { QuestionBankPage } from './features/questions/QuestionBankPage';
import { ExamManagePage } from './features/exams/ExamManagePage';
import { TakeExamPage } from './features/exam-runner/TakeExamPage';
import { ExamResultPage } from './features/exam-runner/ExamResultPage';
import { LiveRoomPage } from './features/live/LiveRoomPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { AuditLogPage } from './features/audit/AuditLogPage';

// Admin Panel Components (Integrated into main layout)
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import { AdminTeachersPage } from './features/admin/AdminTeachersPage';
import { AdminSubjectsPage } from './features/admin/AdminSubjectsPage';
import { AdminRevenuePage } from './features/admin/AdminRevenuePage';

import api from './lib/axios';

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-medium animate-pulse">
        Khởi tạo hệ thống ETech E-Learning...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            {/* Core Home Route (Personalized by role inside HomePage component) */}
            <Route path="/" element={<HomePage user={user} />} />

            {/* Admin Integrated Routes */}
            <Route path="/admin/dashboard" element={user && user.role === 'ADMIN' ? <AdminDashboardPage /> : <Navigate to="/" replace />} />
            <Route path="/admin/users" element={user && user.role === 'ADMIN' ? <AdminUsersPage /> : <Navigate to="/" replace />} />
            <Route path="/admin/teachers" element={user && user.role === 'ADMIN' ? <AdminTeachersPage /> : <Navigate to="/" replace />} />
            <Route path="/admin/subjects" element={user && user.role === 'ADMIN' ? <AdminSubjectsPage /> : <Navigate to="/" replace />} />
            <Route path="/admin/revenue" element={user && user.role === 'ADMIN' ? <AdminRevenuePage /> : <Navigate to="/" replace />} />

            {/* Client & Shared Routes */}
            <Route path="/explore" element={<CatalogPage />} />
            <Route path="/pricing" element={<PricingPage user={user} onUserUpdate={setUser} />} />
            <Route path="/exams/:id" element={<ExamDetailPage user={user} />} />
            <Route path="/exams/:id/take" element={user ? <TakeExamPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/submissions/:id/result" element={user ? <ExamResultPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/live" element={<LiveRoomPage user={user} />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/categories" element={<CategoryPage user={user} />} />
            <Route path="/questions" element={user && (user.role === 'TEACHER' || user.role === 'ADMIN') ? <QuestionBankPage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/manage-exams" element={user && (user.role === 'TEACHER' || user.role === 'ADMIN') ? <ExamManagePage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/dashboard" element={user && (user.role === 'TEACHER' || user.role === 'ADMIN') ? <DashboardPage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/reports" element={user && (user.role === 'TEACHER' || user.role === 'ADMIN') ? <ReportsPage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/audit-logs" element={user && user.role === 'ADMIN' ? <AuditLogPage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onLoginSuccess={setUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}
