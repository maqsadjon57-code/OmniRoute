import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initDb } from './config/database';
import { initRedis } from './config/redis';
import { setupWebsocket } from './websocket/live';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDb().catch(e => console.warn('⚠️ DB not available, running in mock mode:', e.message));
    await initRedis().catch(e => console.warn('⚠️ Redis not available, running in mock mode:', e.message));

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });
    setupWebsocket(io);

    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 AI Fitness Server running on port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🌐 Web Demo: http://localhost:${PORT}/`);
    });

  } catch (e) {
    console.error('Failed to start', e);
    process.exit(1);
  }
}

start();
