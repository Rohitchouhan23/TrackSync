import { Kafka } from 'kafkajs';

export const kafka = process.env.KAFKA_BROKER
  ? new Kafka({
      clientId: 'location-tracker',
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,                        // ✅ Aiven ke liye zaroori
      connectionTimeout: 3000,
      authenticationTimeout: 3000,
      retry: {
        retries: 0,                     // ✅ Retry mat karo — crash rokta hai
      },
    })
  : null;

export const producer = kafka ? kafka.producer() : null;
export const consumer = kafka ? kafka.consumer({ groupId: 'location-group' }) : null;

export const connectKafka = async () => {
  if (!kafka) {
    console.log("⚠️ Kafka not configured, skipping...");
    return;
  }
  try {
    await producer.connect();
    await consumer.connect();
    console.log('✅ Kafka connected');
  } catch (err) {
    console.log("⚠️ Kafka disabled:", err.message); // ✅ error mat throw karo
  }
};