import express from "express";
import { searchMedicines } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/search
router.get("/", protect, searchMedicines);

export default router;