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

  // Used only for quotation type
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

  // Quotation object
  isQuotation: {
    type: Boolean,
    default: false,
  },
  quotation: {
    estimatedPrice: { type: Number },
    estimatedTime: { type: String },
    vendorNotes: { type: String },
  },

  // ✅ NEW: Status of application
  status: {
    type: String,
    enum: ["applied", "ongoing", "completed", "approved"],
    default: "applied",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
