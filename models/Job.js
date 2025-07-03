const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
  },
  requiredExperience: {
    type: String, // could also be Number or enum like "0-1 yrs", "2-5 yrs"
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    googleMapLink: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Job", jobSchema);
