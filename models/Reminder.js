import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    time: { type: String, required: true }, // "HH:MM"
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    notes: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔧 FIX #12: scheduler runs every minute filtering by isActive + time
reminderSchema.index({ isActive: 1, time: 1 });
reminderSchema.index({ userId: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
