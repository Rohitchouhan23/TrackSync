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

const allowedOrigins = [
  "http://localhost:5173",
  "https://track-sync-one.vercel.app"
];

// ✅ Bas yahi kafi hai — app.options hatao bilkul
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

connectDB();

if (process.env.REDIS_URL) {
  connectRedis();
} else {
  console.log("⚠️ Redis disabled");
}

if (process.env.KAFKA_BROKER) {
  connectKafka();
} else {
  console.log("⚠️ Kafka disabled");
}

initSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));