import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export function setupWebsocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      (socket as any).userId = payload.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`User ${userId} connected via WS`);

    socket.on('join-competition', (competitionId: string) => {
      socket.join(`competition:${competitionId}`);
    });

    socket.on('rep-update', (data: { competitionId: string; reps: number }) => {
      // Broadcast to competition room
      io.to(`competition:${data.competitionId}`).emit('leaderboard-update', {
        userId,
        reps: data.reps,
        timestamp: Date.now()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}
