import jwt from 'jsonwebtoken';
import { publishLocation } from '../kafka/producer.js';
import { startConsumer } from '../kafka/consumer.js';
import { redisClient } from '../config/redis.js';
import Session from '../models/Session.js';

// ✅ Redis safe wrapper
const safeRedisGet = async (key) => {
  try {
    if (!redisClient?.isReady) return null;
    return await redisClient.get(key);
  } catch {
    return null;
  }
};

const safeRedisSet = async (key, value) => {
  try {
    if (!redisClient?.isReady) return;
    await redisClient.set(key, value);
  } catch {}
};

export const initSocket = (io) => {
  try {
    startConsumer(io);
  } catch (err) {
    console.log("⚠️ Consumer disabled:", err.message);
  }

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

    socket.on('startSharing', async ({ sessionId }) => {
      try {
        const cached = await safeRedisGet(`session:${sessionId}`);
        // ✅ Redis nahi hai toh MongoDB se check karo
        if (!cached) {
          const session = await Session.findOne({ sessionId, active: true });
          if (!session) return socket.emit('error', { message: 'Session expired' });
        }
        socket.join(`session:${sessionId}`);
        socket.sessionId = sessionId;
        console.log(`📡 Sender joined session: ${sessionId}`);
      } catch (err) {
        console.log("startSharing error:", err.message);
      }
    });

    socket.on('watchSession', async ({ sessionId }) => {
      try {
        socket.join(`session:${sessionId}`);
        const lastLoc = await safeRedisGet(`location:${sessionId}`);
        if (lastLoc) socket.emit('locationUpdate', JSON.parse(lastLoc));
      } catch (err) {
        console.log("watchSession error:", err.message);
      }
    });

    socket.on('sendLocation', async ({ sessionId, lat, lng }) => {
      try {
        const cached = await safeRedisGet(`session:${sessionId}`);
        if (!cached) {
          const session = await Session.findOne({ sessionId, active: true });
          if (!session) return socket.emit('sessionExpired');
        }

        // ✅ Kafka available hai toh publish karo, nahi toh direct broadcast karo
        try {
          await publishLocation(sessionId, { lat, lng });
        } catch {
          // Kafka nahi hai — direct socket broadcast karo
          const payload = { lat, lng, timestamp: new Date() };
          io.to(`session:${sessionId}`).emit('locationUpdate', payload);
          await safeRedisSet(`location:${sessionId}`, JSON.stringify(payload));
        }

        await Session.findOneAndUpdate(
          { sessionId },
          { lastLocation: { lat, lng, timestamp: new Date() } }
        );
      } catch (err) {
        console.log("sendLocation error:", err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};