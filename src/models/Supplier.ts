import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: String,
  vat_number: { type: String, unique: true },
  city: String,
  phone_number: String,
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
