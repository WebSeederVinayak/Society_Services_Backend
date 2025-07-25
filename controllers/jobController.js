const Job = require("../models/Job");
const Application = require("../models/Application");

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
      quotationRequired,
    } = req.body;

    const { latitude, longitude, googleMapLink } = location;

    const newJob = new Job({
      society: req.user.id, // from auth middleware
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
      offeredPrice: offeredPricing,
      scheduledFor,
      quotationRequired: quotationRequired || false,
      // ✅ status: "New" is set by default in schema
    });

    await newJob.save();
    res.status(201).json({
      msg: "Job posted successfully",
      job: {
        ...newJob.toObject(),
        status: "New" // ✅ explicitly show in response
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to post job", error: err.message });
  }
};

// 2. Get Jobs Within 20km for Vendors
exports.getNearbyJobs = async (req, res) => {
  try {
    const { longitude, latitude, quotationRequired } = req.query;
    const vendorId = req.user.id; // from authMiddleware

    const filter = {
      geo: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 20000,
        },
      },
      isActive: true,
    };

    if (quotationRequired === "true") {
      filter.quotationRequired = true;
    } else if (quotationRequired === "false") {
      filter.quotationRequired = false;
    }

    const jobs = await Job.find(filter);

    const jobIds = jobs.map((job) => job._id);

    const vendorApplications = await Application.find({
      vendor: vendorId,
      job: { $in: jobIds },
    }).select("job status");

    const statusMap = {};
    vendorApplications.forEach((app) => {
      statusMap[app.job.toString()] = app.status;
    });

    const formattedJobs = jobs.map((job) => ({
      _id: job._id,
      title: job.title,
      type: job.type,
      requiredExperience: job.requiredExperience,
      details: job.details,
      contactNumber: job.contactNumber,
      location: job.location,
      offeredPricing: job.offeredPrice,
      quotationRequired: job.quotationRequired,
      scheduledFor: job.scheduledFor,
      status: job.status, // ✅ society-defined status
      applicationStatus: statusMap[job._id.toString()] || null,
      postedAt: new Date(job.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    }));

    res.json(formattedJobs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching nearby jobs", error: err.message });
  }
};
