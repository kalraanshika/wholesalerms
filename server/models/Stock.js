import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true },
  reorderLevel: { type: Number, required: true },
  supplier: { type: String, required: true },
}, { timestamps: true });

const Stock = mongoose.model("Stock", stockSchema);
export default Stock;
