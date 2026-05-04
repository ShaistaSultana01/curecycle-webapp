import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import startReminderScheduler from "./services/reminderScheduler.js";
import Notification from "./models/Notification.js";
import scanRoutes from "./routes/scanRoutes.js";
import startExpiryScheduler from "./services/expiryScheduler.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import barcodeRoutes from "./routes/barcodeRoutes.js";
import smartScanRoutes from "./routes/smartScanRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

const app = express();

// Ensure uploads dir exists (multer will crash without it)
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });

// Connect Database
connectDB();
startReminderScheduler();
startExpiryScheduler();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://curecycle.lovable.app",
    /\.lovable\.app$/,
  ],
  credentials: true,
}));


app.use(express.json({ limit: "1mb" }));

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 CureCycle API Running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/barcode", barcodeRoutes);
app.use("/api/smart-scan", smartScanRoutes);

// 🔒 FIX #10: notifications now require auth + scoped to user
app.get("/api/notifications", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("GET /notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/notifications/:id/read", protect, async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification: item });
  } catch (error) {
    console.error("PUT /notifications/:id/read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// 🔒 FIX #11: global error handler — never leak internal errors in prod
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "Server error" : err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
