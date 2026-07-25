const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const prisma = require('./config/prisma');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 E-Learning Backend Server listening on http://localhost:${PORT}`);
  logger.info(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Process terminated.');
  });
});
