import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import supplierRoutes from "./api/supplier";
import { startKafkaConsumer, shutdownKafkaConsumer } from "./kafka/consumer";
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.APP_PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: "*", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/v1/api", supplierRoutes);

mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@mongodb:27017`,
    {
      dbName: "test",
    }
  )
  .then(() => {
    console.log("MongoDB connected");
    startKafkaConsumer();
  });

export default app;
export { shutdownKafkaConsumer };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
