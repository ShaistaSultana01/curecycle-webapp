import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineName: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    quantity: { type: Number, required: true, min: 0 },
    dosage: { type: String, default: "", trim: true },
    expiryDate: { type: Date, required: true },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// 🔧 FIX #12: indexes for dashboard / expiring / search queries
medicineSchema.index({ userId: 1, expiryDate: 1 });
medicineSchema.index({ userId: 1, medicineName: 1 });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
