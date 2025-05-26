import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: String,
  vat_number: { type: String, unique: true },
  city: String,
  phone_number: String,
}, { _id: false });

export const Supplier = mongoose.model("Supplier", supplierSchema);
