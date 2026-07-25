import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/common/Layout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { ExamDetailPage } from './features/catalog/ExamDetailPage';
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
        Khởi tạo hệ thống E-Learning...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/exams/:id" element={<ExamDetailPage user={user} />} />
            <Route path="/exams/:id/take" element={user ? <TakeExamPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/submissions/:id/result" element={user ? <ExamResultPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/live" element={user ? <LiveRoomPage user={user} /> : <Navigate to="/login" replace />} />
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
