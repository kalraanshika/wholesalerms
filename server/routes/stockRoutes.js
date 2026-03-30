import express from "express";
import { getAllStock, createStock, updateStock, deleteStock } from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getAllStock).post(createStock);
router.route("/:id").put(updateStock).delete(deleteStock);

export default router;
