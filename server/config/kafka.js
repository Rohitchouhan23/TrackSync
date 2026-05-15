import { Kafka } from 'kafkajs';

export const kafka = process.env.KAFKA_BROKER
  ? new Kafka({
      clientId: 'location-tracker',
      brokers: [process.env.KAFKA_BROKER],
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
    console.error('Kafka error:', err.message);
  }
};