const Application = require("../models/Application");
const Job = require("../models/Job");
const Vendor = require("../models/vendorSchema");

// 3. Vendor Applies to a Job (With Quotation or Direct Apply)
exports.applyToJob = async (req, res) => {
  try {
    const {
      message,
      applicationType,
      quotedPrice,
      estimatedTime,
      additionalNotes,
    } = req.body;
    const jobId = req.params.id;

    const existing = await Application.findOne({ job: jobId, vendor: req.user.id });
    if (existing)
      return res.status(400).json({ msg: "Already applied to this job" });

    const application = new Application({
      job: jobId,
      vendor: req.user.id,
      message,
      applicationType,
      status: "applied", // ✅ explicitly set
    });

    if (applicationType === "quotation") {
      application.quotedPrice = quotedPrice;
      application.estimatedTime = estimatedTime;
      application.additionalNotes = additionalNotes;
    }

    await application.save();
    res.status(201).json({ msg: "Application submitted", application });
  } catch (err) {
    res.status(500).json({ msg: "Failed to apply", error: err.message });
  }
};

// 4. Society views all applicants for a job
exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.society.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    const applications = await Application.find({ job: jobId })
      .populate("vendor", "name email phone rating experience")
      .select("-__v");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get applicants", error: err.message });
  }
};

// ✅ Get all applications for logged-in vendor by status
exports.getApplicationsByStatus = async (req, res) => {
  const { status } = req.params;
  const validStatuses = ["applied", "ongoing", "completed", "approved"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: "Invalid status filter" });
  }

  try {
    const applications = await Application.find({
      vendor: req.user.id,
      status,
    }).populate("job");

    res.status(200).json({ applications });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch applications", error: err.message });
  }
};
