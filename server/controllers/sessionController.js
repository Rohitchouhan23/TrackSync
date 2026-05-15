import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';
import { redisClient } from '../config/redis.js';

// ✅ Safe Redis helpers
const safeRedisSetEx = async (key, ttl, value) => {
  try {
    if (!redisClient?.isReady) return;
    await redisClient.setEx(key, ttl, value);
  } catch (err) {
    console.log("⚠️ Redis setEx failed:", err.message);
  }
};

const safeRedisGet = async (key) => {
  try {
    if (!redisClient?.isReady) return null;
    return await redisClient.get(key);
  } catch (err) {
    console.log("⚠️ Redis get failed:", err.message);
    return null;
  }
};

const safeRedisDel = async (key) => {
  try {
    if (!redisClient?.isReady) return;
    await redisClient.del(key);
  } catch (err) {
    console.log("⚠️ Redis del failed:", err.message);
  }
};

export const createSession = async (req, res) => {
  try {
    const { duration } = req.body;
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const session = await Session.create({
      sessionId,
      sender: req.user.id,
      duration,
      expiresAt,
    });

    // ✅ Redis crash nahi karega agar connected nahi hai
    await safeRedisSetEx(
      `session:${sessionId}`,
      duration * 60,
      JSON.stringify({ senderId: req.user.id, active: true })
    );

    res.status(201).json({ sessionId, shareLink: `/view/${sessionId}`, expiresAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // ✅ Redis nahi hai toh MongoDB se check karo
    const cached = await safeRedisGet(`session:${sessionId}`);
    if (!cached) {
      const sessionExists = await Session.findOne({ sessionId, active: true });
      if (!sessionExists) return res.status(404).json({ message: 'Session expired or not found' });
    }

    const session = await Session.findOne({ sessionId }).populate('sender', 'username');
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ sender: req.user.id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findOneAndUpdate({ sessionId }, { active: false });
    await safeRedisDel(`session:${sessionId}`);
    res.json({ message: 'Session stopped' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};