const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const errorHandler = require('./middlewares/error.middleware');

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

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'E-Learning API is operational', timestamp: new Date() });
});

// Swagger Specs
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Learning & Quiz System API',
    version: '1.0.0',
    description: 'REST API documentation for E-Learning & Quiz System Production-Ready MVP'
  },
  servers: [{ url: `http://localhost:${config.port}/api/v1` }]
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
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

// Global Error Handler
app.use(errorHandler);

module.exports = app;
