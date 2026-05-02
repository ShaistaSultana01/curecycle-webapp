import Reminder from "../models/Reminder.js";

// @desc Create Reminder
// @route POST /api/reminders
// @access Private
const createReminder = async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      time,
      frequency,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!medicineName || !dosage || !time || !startDate) {
      return res.status(400).json({
        success: false,
        message: "medicineName, dosage, time, startDate are required",
      });
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      medicineName,
      dosage,
      time,
      frequency,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get My Reminders
// @route GET /api/reminders
// @access Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Update Reminder
// @route PUT /api/reminders/:id
// @access Private
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    Object.assign(reminder, req.body);
    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete Reminder
// @route DELETE /api/reminders/:id
// @access Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
};