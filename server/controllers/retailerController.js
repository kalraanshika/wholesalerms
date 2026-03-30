import Retailer from "../models/Retailer.js";

export const getAllRetailers = async (req, res) => {
  try {
    const retailers = await Retailer.find({ userId: req.user._id });
    res.json(retailers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.create({ ...req.body, userId: req.user._id });
    res.status(201).json(retailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!retailer) return res.status(404).json({ message: "Retailer not found" });
    res.json(retailer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!retailer) return res.status(404).json({ message: "Retailer not found" });
    res.json({ message: "Retailer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
