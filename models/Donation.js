import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    expiryDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["available", "claimed", "completed"],
      default: "available",
    },
  },
  { timestamps: true }
);

// 🔧 FIX #12: public list filters by status + expiryDate
donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ userId: 1, createdAt: -1 });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
