import { consumer } from '../config/kafka.js';
import { redisClient } from '../config/redis.js';

export const startConsumer = async (io) => {
  await consumer.subscribe({ topic: 'location-updates', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      const { sessionId, lat, lng, timestamp } = data;

      // Cache latest location in Redis
      await redisClient.set(
        `location:${sessionId}`,
        JSON.stringify({ lat, lng, timestamp }),
        { XX: false, EX: 3600 }
      );

      // Broadcast to viewers watching this session
      io.to(`session:${sessionId}`).emit('locationUpdate', { lat, lng, timestamp });
    },
  });
};