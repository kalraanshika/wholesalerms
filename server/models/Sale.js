import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "Retailer", required: true },
  date: { type: Date, required: true, default: Date.now },
  items: [saleItemSchema],
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid", "Partial"], default: "Unpaid" },
  dueDate: { type: Date },
  paidDate: { type: Date },
  amountPaid: { type: Number, default: 0 },
}, { timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
