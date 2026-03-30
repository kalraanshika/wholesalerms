import Stock from "../models/Stock.js";

export const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.find({ userId: req.user._id });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const stock = await Stock.create({ ...req.body, userId: req.user._id });
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!stock) return res.status(404).json({ message: "Stock item not found" });
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!stock) return res.status(404).json({ message: "Stock item not found" });
    res.json({ message: "Stock item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
