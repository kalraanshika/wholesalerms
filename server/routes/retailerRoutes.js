import express from "express";
import { getAllRetailers, createRetailer, updateRetailer, deleteRetailer } from "../controllers/retailerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getAllRetailers).post(createRetailer);
router.route("/:id").put(updateRetailer).delete(deleteRetailer);

export default router;
