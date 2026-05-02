import express from "express";
import {
  addMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
  getExpiringMedicines,
} from "../controllers/medicineController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Specific route first
router.get("/expiring", protect, getExpiringMedicines);

// CRUD routes
router.post("/", protect, addMedicine);
router.get("/", protect, getMedicines);
router.put("/:id", protect, updateMedicine);
router.delete("/:id", protect, deleteMedicine);

export default router;