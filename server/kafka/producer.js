import { producer } from '../config/kafka.js';

export const publishLocation = async (sessionId, locationData) => {
  await producer.send({
    topic: 'location-updates',
    messages: [
      {
        key: sessionId,
        value: JSON.stringify({ sessionId, ...locationData, timestamp: Date.now() }),
      },
    ],
  });
};