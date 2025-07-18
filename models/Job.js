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
    type: String,
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
  // ✅ Add this geo field only for spatial index (used by $near)
  geo: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
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

// ✅ Geo index for searching jobs within 20km
jobSchema.index({ geo: "2dsphere" });

module.exports = mongoose.model("Job", jobSchema);
