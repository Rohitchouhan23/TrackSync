import jwt from 'jsonwebtoken';
import { publishLocation } from '../kafka/producer.js';
import { startConsumer } from '../kafka/consumer.js';
import { redisClient } from '../config/redis.js';
import Session from '../models/Session.js';

export const initSocket = (io) => {
  startConsumer(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch {}
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Sender: join their session room & stream location
    socket.on('startSharing', async ({ sessionId }) => {
      const cached = await redisClient.get(`session:${sessionId}`);
      if (!cached) return socket.emit('error', { message: 'Session expired' });
      socket.join(`session:${sessionId}`);
      socket.sessionId = sessionId;
      console.log(`📡 Sender joined session: ${sessionId}`);
    });

    // Viewer: join session room to receive updates
    socket.on('watchSession', async ({ sessionId }) => {
      socket.join(`session:${sessionId}`);
      // Send last known location immediately
      const lastLoc = await redisClient.get(`location:${sessionId}`);
      if (lastLoc) socket.emit('locationUpdate', JSON.parse(lastLoc));
    });

    // Location update from sender
    socket.on('sendLocation', async ({ sessionId, lat, lng }) => {
      const cached = await redisClient.get(`session:${sessionId}`);
      if (!cached) return socket.emit('sessionExpired');

      await publishLocation(sessionId, { lat, lng });
      await Session.findOneAndUpdate(
        { sessionId },
        { lastLocation: { lat, lng, timestamp: new Date() } }
      );
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};