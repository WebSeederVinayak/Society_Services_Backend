const Job = require("../models/Job");

// 1. Create Job (Society Only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      type,
      requiredExperience,
      details,
      contactNumber,
      location,
      offeredPricing,
      scheduledFor,
    } = req.body;

    const { latitude, longitude, googleMapLink } = location;

    const newJob = new Job({
      society: req.user.id, // coming from auth middleware
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
      offeredPrice: offeredPricing, // Use offeredPricing as alias
      scheduledFor,
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
    })
      .sort({ createdAt: -1 })
      .select("-__v")
      .populate("society", "name address");

    const formattedJobs = jobs.map((job) => ({
      _id: job._id,
      title: job.title,
      type: job.type,
      requiredExperience: job.requiredExperience,
      details: job.details,
      contactNumber: job.contactNumber,
      location: job.location,
      offeredPricing: job.offeredPrice,
      scheduledFor: job.scheduledFor,
      postedAt: new Date(job.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      society: job.society,
    }));

    res.json(formattedJobs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching nearby jobs", error: err.message });
  }
};
