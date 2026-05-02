import Donation from "../models/Donation.js";

// @desc Create Donation
// @route POST /api/donations
// @access Private
const createDonation = async (req, res) => {
  try {
    const {
      medicineName,
      quantity,
      expiryDate,
      location,
      contactNumber,
      notes,
    } = req.body;

    if (
      !medicineName ||
      quantity == null ||
      !expiryDate ||
      !location ||
      !contactNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const donation = await Donation.create({
      userId: req.user._id,
      medicineName,
      quantity,
      expiryDate,
      location,
      contactNumber,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get My Donations
// @route GET /api/donations/my
// @access Private
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get All Available Donations
// @route GET /api/donations/all
// @access Public
const getAllDonations = async (req, res) => {
  try {
    const today = new Date();

    const donations = await Donation.find({
      status: "available",
      expiryDate: { $gte: today },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update Donation Status
// @route PUT /api/donations/:id/status
// @access Private
const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const donation = await Donation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.status = status || donation.status;
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation status updated",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete Donation
// @route DELETE /api/donations/:id
// @access Private
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createDonation,
  getMyDonations,
  getAllDonations,
  updateDonationStatus,
  deleteDonation,
};