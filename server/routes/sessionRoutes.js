import express from 'express';
import { createSession, getSession, getMySessions, stopSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/', protect, createSession);
router.get('/mine', protect, getMySessions);
router.get('/:sessionId', getSession);
router.patch('/:sessionId/stop', protect, stopSession);
export default router;