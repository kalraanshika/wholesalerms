import express from "express";
import { getAllSales, createSale, updateSale, deleteSale, recordPayment } from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getAllSales).post(createSale);
router.route("/:id").put(updateSale).delete(deleteSale);
router.route("/:id/payment").put(recordPayment);

export default router;
