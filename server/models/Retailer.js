import mongoose from "mongoose";

const retailerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, enum: ["Active", "Suspended", "Inactive"], default: "Active" },
  creditLimit: { type: Number, required: true, default: 0 },
  balance: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Retailer = mongoose.model("Retailer", retailerSchema);
export default Retailer;
