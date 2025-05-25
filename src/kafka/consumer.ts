import { Kafka } from "kafkajs";
import { Supplier } from "../models/Supplier";

const kafka = new Kafka({
  clientId: "1f31221a5a702c95a2eeaebf0ac3152c3b3956de7525d119a8b3b675dc494502",
  brokers: ["localhost:9092"],
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

        if (data.action === "delete") {
          if (existing) {
            await Supplier.deleteOne({ vat_number: data.vat_number });
            console.log("Deleted supplier with VAT:", data.vat_number);
          }
        } else if (existing) {
          await Supplier.updateOne({ vat_number: data.vat_number }, data);
          console.log("Updated supplier with VAT:", data.vat_number);
        } else {
          await Supplier.create(data);
          console.log("Inserted new supplier:", data);
        }
      }
    },
  });
};
