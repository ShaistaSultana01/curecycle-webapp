import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail, wrapEmail } from "./emailService.js";

// Runs every minute
const startReminderScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reminders = await Reminder.find({
        isActive: true,
        time: currentTime,
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: today } }],
      });

      for (const reminder of reminders) {
        const message = `Time to take ${reminder.medicineName} (${reminder.dosage})`;

        const exists = await Notification.findOne({
          userId: reminder.userId,
          title: "Medicine Reminder",
          message,
          createdAt: { $gte: new Date(now.getTime() - 60000) },
        });

        if (exists) continue;

        await Notification.create({
          userId: reminder.userId,
          title: "Medicine Reminder",
          message,
          type: "reminder",
        });

        // 📧 Also email the user
        try {
          const user = await User.findById(reminder.userId).select("email fullName");
          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: `💊 Time to take ${reminder.medicineName}`,
              text: message,
              html: wrapEmail(
                `Hi ${user.fullName?.split(" ")[0] || "there"} 👋`,
                `<p>It's <b>${currentTime}</b> — time for your dose:</p>
                 <p style="font-size:16px;background:#f1f5f9;padding:12px;border-radius:6px;">
                   <b>${reminder.medicineName}</b> — ${reminder.dosage}
                 </p>
                 <p>Stay healthy!</p>`
              ),
            });
          }
        } catch (e) {
          console.error("Reminder email failed:", e.message);
        }
      }

      console.log(`⏰ Reminder check completed at ${currentTime}`);
    } catch (error) {
      console.error("Reminder Scheduler Error:", error.message);
    }
  });
};

export default startReminderScheduler;
