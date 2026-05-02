import Medicine from "../models/Medicine.js";
import Donation from "../models/Donation.js";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?._id; // if auth middleware used

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    const medicineFilter = userId ? { userId } : {};
    const commonFilter = userId ? { userId } : {};

    const totalMedicines = await Medicine.countDocuments(medicineFilter);

    const expiredMedicines = await Medicine.countDocuments({
      ...medicineFilter,
      expiryDate: { $lt: today },
    });

    const expiringSoon = await Medicine.countDocuments({
      ...medicineFilter,
      expiryDate: { $gte: today, $lte: sevenDaysLater },
    });

    const totalDonations = await Donation.countDocuments(commonFilter);
    const totalReminders = await Reminder.countDocuments(commonFilter);
    const totalNotifications = await Notification.countDocuments(commonFilter);

    res.status(200).json({
      success: true,
      data: {
        totalMedicines,
        expiredMedicines,
        expiringSoon,
        totalDonations,
        totalReminders,
        totalNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getDashboardStats };