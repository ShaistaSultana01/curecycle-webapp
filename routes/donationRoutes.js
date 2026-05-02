import express from "express";
import {
  createDonation,
  getMyDonations,
  getAllDonations,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/all", getAllDonations);

// Private
router.post("/", protect, createDonation);
router.get("/my", protect, getMyDonations);
router.put("/:id/status", protect, updateDonationStatus);
router.delete("/:id", protect, deleteDonation);

export default router;