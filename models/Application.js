const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  message: {
    type: String,
  },
  applicationType: {
    type: String,
    enum: ["direct", "quotation"],
    required: true,
  },
  quotedPrice: {
    type: Number,
  },
  estimatedTime: {
    hours: { type: Number },
    minutes: { type: Number },
  },
  additionalNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["approval_pending", "approved", "rejected", "completed"],
    default: "approval_pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
