/**
 * Điểm vào Express: thứ tự middleware RẤT QUAN TRỌNG.
 * Request đi từ trên xuống: CORS → cookieParser → JSON → routes → 404 → errorHandler
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const errorHandler = require('./middlewares/error.middleware');
const notFoundHandler = require('./middlewares/notFound.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const categoryRoutes = require('./modules/category/category.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const questionRoutes = require('./modules/question/question.routes');
const examRoutes = require('./modules/exam/exam.routes');
const submissionRoutes = require('./modules/submission/submission.routes');
const liveRoutes = require('./modules/live/live.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');
const reportRoutes = require('./modules/report/report.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const subscriptionRoutes = require('./modules/subscription/subscription.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const workspaceRoutes = require('./modules/workspace/workspace.routes');

const app = express();

app.set('trust proxy', 1); // tin header X-Forwarded-* khi đứng sau nginx / reverse proxy

// credentials: true = cho phép trình duyệt gửi cookie cross-origin (5173 → 5050)
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser()); // biến header Cookie thành req.cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'E-Learning & Quiz System API is running', docs: '/api-docs' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'E-Learning API is operational', timestamp: new Date() });
});

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Learning & Quiz System API',
    version: '1.1.0',
    description: 'REST API documentation for E-Learning & Quiz System — Auth cookie-based (password, Google, email verification)'
  },
  servers: [{ url: `http://localhost:${config.port}/api/v1` }]
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/live', liveRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/workspaces', workspaceRoutes);

app.use(notFoundHandler); // không khớp route nào
app.use(errorHandler);    // phải đứng cuối, 4 tham số (err, req, res, next)

module.exports = app;
