import Sale from "../models/Sale.js";
import Stock from "../models/Stock.js";

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user._id })
      .populate("retailerId", "name city")
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const sale = await Sale.create({ ...req.body, userId: req.user._id });

    for (const item of req.body.items) {
      await Stock.findOneAndUpdate(
        { _id: item.stockId, userId: req.user._id },
        { $inc: { quantity: -item.qty } }
      );
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { amount, paidDate } = req.body;
    const sale = await Sale.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    sale.amountPaid = (sale.amountPaid || 0) + amount;
    sale.paidDate = paidDate || new Date();

    if (sale.amountPaid >= sale.total) {
      sale.paymentStatus = "Paid";
    } else if (sale.amountPaid > 0) {
      sale.paymentStatus = "Partial";
    }

    await sale.save();
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
