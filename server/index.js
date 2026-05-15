import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { connectKafka } from "./config/kafka.js";

import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { initSocket } from "./socket/socketHandler.js";

const app = express();
const httpServer = http.createServer(app);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://track-sync-one.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

/* ---------------- SOCKET ---------------- */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});

/* ---------------- DB ---------------- */
connectDB();

/* ---------------- KAFKA SAFE ---------------- */
if (process.env.KAFKA_BROKER) {
  try {
    connectKafka(); // ✅ correct function name
    console.log("✅ Kafka connected");
  } catch (err) {
    console.log("⚠️ Kafka error:", err.message);
  }
} else {
  console.log("⚠️ Kafka disabled");
}

/* ---------------- REDIS SAFE ---------------- */
if (process.env.REDIS_URL) {
  try {
    connectRedis();
    console.log("✅ Redis connected");
  } catch (err) {
    console.log("⚠️ Redis error:", err.message);
  }
} else {
  console.log("⚠️ Redis disabled");
}

/* ---------------- SOCKET INIT ---------------- */
initSocket(io);

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);