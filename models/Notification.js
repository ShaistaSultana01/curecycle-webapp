import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["reminder", "expiry", "donation", "system"],
      default: "reminder",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔧 FIX #12: notifications list is sorted by createdAt desc per user
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
