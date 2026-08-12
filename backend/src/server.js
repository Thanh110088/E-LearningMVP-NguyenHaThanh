const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const prisma = require('./config/prisma');
const { initSocket } = require('./config/socket.config');
const { setupLiveSockets } = require('./modules/live/live.socket');

const PORT = config.port;

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
setupLiveSockets(io);

const server = httpServer.listen(PORT, () => {
  logger.info(`🚀 E-Learning Backend Server listening on http://localhost:${PORT}`);
  logger.info(`⚡ Realtime Socket.IO Live Engine attached`);
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
