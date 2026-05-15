import { createClient } from 'redis';

export const redisClient = createClient({ url: process.env.REDIS_URL });

export const connectRedis = async () => {
  redisClient.on('error', (err) => console.error('Redis error:', err));
  await redisClient.connect();
  console.log('✅ Redis connected');
};