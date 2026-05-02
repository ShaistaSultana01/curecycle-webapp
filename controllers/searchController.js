import Medicine from "../models/Medicine.js";

// 🔧 FIX #9: escape regex specials to prevent ReDoS / injection
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/search?keyword=para&status=expired|soon|all
const searchMedicines = async (req, res) => {
  try {
    const userId = req.user._id;
    const { keyword = "", status = "all" } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    const query = {
      userId,
      medicineName: { $regex: escapeRegex(keyword), $options: "i" },
    };

    if (status === "expired") {
      query.expiryDate = { $lt: today };
    } else if (status === "soon") {
      query.expiryDate = { $gte: today, $lte: sevenDaysLater };
    }

    const medicines = await Medicine.find(query).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error("searchMedicines error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

export { searchMedicines };
