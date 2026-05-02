import express from "express";
import { barcodeLookup } from "../controllers/barcodeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/barcode
router.post("/", protect, barcodeLookup);

export default router;