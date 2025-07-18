const Job = require("../models/Job");

// 1. Create Job (Society Only)
exports.createJob = async (req, res) => {
  try {
    const { title, type, requiredExperience, details, contactNumber, location } = req.body;

    // Extract lat/lng from location object
    const { latitude, longitude, googleMapLink } = location;

    const newJob = new Job({
      society: req.user.id, // if you're using auth middleware
      title,
      type,
      requiredExperience,
      details,
      contactNumber,
      location: {
        latitude,
        longitude,
        googleMapLink,
      },
      geo: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    await newJob.save();
    res.status(201).json({ msg: "Job posted successfully", job: newJob });
  } catch (err) {
    res.status(500).json({ msg: "Failed to post job", error: err.message });
  }
};

// 2. Get Jobs Within 20km for Vendors
exports.getNearbyJobs = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    const jobs = await Job.find({
      geo: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 20000, // 20km in meters
        },
      },
      isActive: true,
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching nearby jobs", error: err.message });
  }
};
