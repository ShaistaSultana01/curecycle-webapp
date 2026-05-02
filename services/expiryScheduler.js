import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail, wrapEmail } from "./emailService.js";

const fmt = (d) => new Date(d).toISOString().split("T")[0];

const startExpiryScheduler = () => {
  // Runs every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("⏰ Running expiry check...");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      sevenDaysLater.setHours(23, 59, 59, 999);

      const medicines = await Medicine.find({
        expiryDate: { $exists: true, $ne: null },
      }).populate("userId", "email fullName");

      // Group by user → one digest email per user, not one per medicine
      const userBuckets = new Map();

      for (const med of medicines) {
        const exp = new Date(med.expiryDate);
        let title = "";
        let message = "";

        if (exp < today) {
          title = "Medicine Expired";
          message = `${med.medicineName} has expired (${fmt(exp)}).`;
        } else if (exp >= today && exp <= sevenDaysLater) {
          title = "Medicine Expiring Soon";
          message = `${med.medicineName} will expire on ${fmt(exp)}.`;
        }
        if (!title) continue;

        const userId = med.userId?._id || med.userId;
        const existing = await Notification.findOne({
          userId,
          title,
          message,
          createdAt: { $gte: today },
        });
        if (existing) continue;

        await Notification.create({ userId, title, message, type: "expiry" });

        // Bucket for digest email
        if (med.userId?.email) {
          const key = String(userId);
          if (!userBuckets.has(key)) {
            userBuckets.set(key, {
              email: med.userId.email,
              name: med.userId.fullName,
              expired: [],
              soon: [],
            });
          }
          const bucket = userBuckets.get(key);
          if (exp < today) bucket.expired.push({ name: med.medicineName, date: fmt(exp) });
          else bucket.soon.push({ name: med.medicineName, date: fmt(exp) });
        }
      }

      // 📧 Send one digest per user
      for (const { email, name, expired, soon } of userBuckets.values()) {
        const total = expired.length + soon.length;
        const list = (items) =>
          items
            .map(
              (i) =>
                `<li><b>${i.name}</b> — ${i.date}</li>`
            )
            .join("");

        const body = `
          ${expired.length ? `<p><b style="color:#dc2626;">⚠️ Expired (${expired.length}):</b></p><ul>${list(expired)}</ul>` : ""}
          ${soon.length ? `<p><b style="color:#d97706;">⏳ Expiring within 7 days (${soon.length}):</b></p><ul>${list(soon)}</ul>` : ""}
          <p style="margin-top:16px;">Consider donating soon-to-expire medicines through CureCycle 💚</p>
        `;

        try {
          await sendEmail({
            to: email,
            subject: `📋 CureCycle: ${total} medicine${total > 1 ? "s" : ""} need attention`,
            text: `You have ${total} medicines that need attention. Open CureCycle to review.`,
            html: wrapEmail(
              `Hi ${name?.split(" ")[0] || "there"} 👋`,
              body
            ),
          });
        } catch (e) {
          console.error("Expiry email failed:", e.message);
        }
      }

      console.log(`✅ Expiry check complete (${userBuckets.size} users notified)`);
    } catch (error) {
      console.error("❌ Expiry Scheduler Error:", error.message);
    }
  });
};

export default startExpiryScheduler;
