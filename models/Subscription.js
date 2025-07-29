const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  planPrice: {
    type: Number,
    default: 999,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  subscriptionStatus: {
    type: String,
    enum: ["Active", "Expired", "Cancelled"],
    default: "Active",
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);
