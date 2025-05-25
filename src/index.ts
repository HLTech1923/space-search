import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import supplierRoutes from "./api/supplier";
import { startKafkaConsumer } from "./kafka/consumer";

dotenv.config();
const app = express();
const port = process.env.APP_PORT || 3000;

app.use(express.json());
app.use("/api", supplierRoutes);

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

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
