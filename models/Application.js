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
  applicationType: {
    type: String,
    enum: ["direct", "quotation"],
    required: true,
  },
  // These fields are only used if type === quotation
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

  // ✅ Added new format for compatibility with existing system
  isQuotation: {
    type: Boolean,
    default: false,
  },
  quotation: {
    estimatedPrice: { type: Number },
    estimatedTime: { type: String },
    vendorNotes: { type: String },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
