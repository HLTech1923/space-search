import { Kafka } from "kafkajs";
import { Supplier } from "../models/Supplier";

const kafka = new Kafka({
  clientId: process.env.KAFKA_ID,
  brokers: [process.env.KAFKA_HOST as string],
});

const consumer = kafka.consumer({ groupId: "supplier-group" });

export const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "suppliers", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        const data = JSON.parse(message.value.toString());

        const existing = await Supplier.findOne({
          vat_number: data.vat_number,
        });
        console.log(data);
        
        if (data.action === "delete") {
          if (existing) {
            // await Supplier.deleteOne({ vat_number: data.vat_number });
            console.log("Deleted supplier with VAT:", data.vat_number);
          }
        } else if (existing) {
          // await Supplier.updateOne({ vat_number: data.vat_number }, data);
          console.log("Updated supplier with VAT:", data.vat_number);
        } else {
          // await Supplier.create(data);
          console.log("Inserted new supplier:", data);
        }
      }
    },
  });
};
