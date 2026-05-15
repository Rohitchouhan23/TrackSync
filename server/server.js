import "dotenv/config";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { connectKafka } from './config/kafka.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { initSocket } from './socket/socketHandler.js';



const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// Init services
connectDB();
if (process.env.REDIS_URL) {
  connectRedis();
} else {
  console.log("⚠️ Redis disabled (no REDIS_URL)");
}

if (process.env.KAFKA_BROKER) {
  connectKafka();
} else {
  console.log("⚠️ Kafka disabled (no KAFKA_BROKER)");
}
initSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));