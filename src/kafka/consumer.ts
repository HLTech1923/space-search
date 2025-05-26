import { Kafka } from "kafkajs";
import { Supplier } from "../models/Supplier";

const kafka = new Kafka({
  clientId: process.env.KAFKA_ID,
  brokers: [`${process.env.KAFKA_HOST || "kafka:9092"}`],
});

const consumer = kafka.consumer({ groupId: "supplier-group" });

async function retryOperation(operation: () => Promise<any>, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 1000)); // Optional delay between retries
      }
    }
  }
  throw lastError;
}

export const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "suppliers", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        try {
          const queue = JSON.parse(message.value.toString());

          const existing = await Supplier.findOne({
            vat_number: queue.data.vat_number,
          });

          if (queue.action === "delete") {
            if (existing) {
              await retryOperation(() =>
                Supplier.deleteOne({ vat_number: queue.data.vat_number })
              );
            }
          } else if (existing) {
            await retryOperation(() =>
              Supplier.updateOne({ vat_number: queue.data.vat_number }, queue.data)
            );
          } else {
            await retryOperation(() => Supplier.create(queue.data));
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
  });
};

export const shutdownKafkaConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log("Kafka consumer disconnected");
  } catch (error) {
    console.error("Failed to disconnect Kafka consumer", error);
  }
};
