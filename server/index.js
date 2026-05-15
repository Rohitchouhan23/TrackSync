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
  "https://track-sync-one.vercel.app",
  "https://track-sync-j63g.vercel.app",  // ✅ naya URL add kiya
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options(/.*/, cors());

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

/* ---------------- REDIS ---------------- */
if (process.env.REDIS_URL) {
  connectRedis().catch((err) => {       // ✅ async catch
    console.log("⚠️ Redis disabled:", err.message);
  });
} else {
  console.log("⚠️ Redis disabled");
}

/* ---------------- KAFKA ---------------- */
if (process.env.KAFKA_BROKER) {
  connectKafka().catch((err) => {       // ✅ async catch — crash nahi hoga
    console.log("⚠️ Kafka disabled:", err.message);
  });
} else {
  console.log("⚠️ Kafka disabled");
}

/* ---------------- UNHANDLED SAFETY NET ---------------- */
process.on("unhandledRejection", (reason) => {
  console.log("⚠️ Unhandled Rejection:", reason?.message || reason);
});

/* ---------------- SOCKET INIT ---------------- */
initSocket(io);

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);