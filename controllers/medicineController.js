import Medicine from "../models/Medicine.js";

// @desc Add Medicine
// @route POST /api/medicines
// @access Private
const addMedicine = async (req, res) => {
  try {
    const {
      medicineName,
      category,
      quantity,
      dosage,
      expiryDate,
      notes,
    } = req.body;

    if (!medicineName || quantity == null || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "medicineName, quantity and expiryDate are required",
      });
    }

    const medicine = await Medicine.create({
      userId: req.user._id,
      medicineName,
      category,
      quantity,
      dosage,
      expiryDate,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get All Medicines for Logged User
// @route GET /api/medicines
// @access Private
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user._id,
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update Medicine
// @route PUT /api/medicines/:id
// @access Private
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    Object.assign(medicine, req.body);
    await medicine.save();

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete Medicine
// @route DELETE /api/medicines/:id
// @access Private
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get Expiring Medicines (next 7 days + expired)
// @route GET /api/medicines/expiring
// @access Private
const getExpiringMedicines = async (req, res) => {
  try {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const medicines = await Medicine.find({
      userId: req.user._id,
      expiryDate: { $lte: next7Days },
    }).sort({ expiryDate: 1 });

    const data = medicines.map((item) => {
      const expired = new Date(item.expiryDate) < today;
      return {
        ...item.toObject(),
        status: expired ? "expired" : "expiring-soon",
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      medicines: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
  getExpiringMedicines,
};