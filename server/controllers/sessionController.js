import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';
import { redisClient } from '../config/redis.js';

export const createSession = async (req, res) => {
  try {
    const { duration } = req.body; // minutes: 10, 30, 60
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const session = await Session.create({
      sessionId,
      sender: req.user.id,
      duration,
      expiresAt,
    });

    // Store in Redis with TTL
    await redisClient.setEx(
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
    const cached = await redisClient.get(`session:${sessionId}`);
    if (!cached) return res.status(404).json({ message: 'Session expired or not found' });

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
    await redisClient.del(`session:${sessionId}`);
    res.json({ message: 'Session stopped' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};