import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'location-tracker',
  brokers: [process.env.KAFKA_BROKER],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'location-group' });

export const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log('✅ Kafka connected');
  } catch (err) {
    console.error('Kafka error:', err.message);
  }
};