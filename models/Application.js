const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  message: String,
  offeredPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending", // can be "pending", "accepted", etc.
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
