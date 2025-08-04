const Application = require("../models/Application");
const Job = require("../models/Job");
const Vendor = require("../models/vendorSchema");

// Vendor shows interest or applies with quotation
exports.applyToJob = async (req, res) => {
  try {
    const {
      applicationType, // 'interest' or 'quotation'
      message,
      quotedPrice,
      estimatedTime,
      additionalNotes,
    } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const existing = await Application.findOne({ job: jobId, vendor: req.user.id });
    if (existing)
      return res.status(400).json({ msg: "Already shown interest/applied for this job" });

    const application = new Application({
      job: jobId,
      vendor: req.user.id,
      applicationType,
      status: "approval pending",
    });

    // If vendor applied with quotation
    if (applicationType === "quotation") {
      application.message = message;
      application.quotedPrice = quotedPrice;
      application.estimatedTime = estimatedTime;
      application.additionalNotes = additionalNotes;
    }

    // Change job status only for new jobs
    if (job.status === "New") {
      job.status = "Applied";
      await job.save();
    }

    await application.save();

    // [Optional Placeholder] Trigger notification to society
    // await sendNotificationToSociety(job.society, req.user.id, applicationType);

    res.status(201).json({ msg: `Application (${applicationType}) submitted`, application });
  } catch (err) {
    res.status(500).json({ msg: "Failed to apply/show interest", error: err.message });
  }
};

// Get all vendors who applied or showed interest for a job
exports.getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.society.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    const applications = await Application.find({ job: jobId })
      .populate("vendor", "name email phone")
      .select("applicationType status vendor");

    const result = applications.map(app => ({
      name: app.vendor.name,
      email: app.vendor.email,
      phone: app.vendor.phone,
      applicationType: app.applicationType,
      status: app.status,
    }));

    res.json({ applicants: result });
  } catch (err) {
    res.status(500).json({ msg: "Failed to get applicants", error: err.message });
  }
};

// Approve application
exports.approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate("job");
    if (!application) return res.status(404).json({ msg: "Application not found" });

    if (application.job.society.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    application.status = "approved";
    await application.save();

    const job = await Job.findById(application.job._id);
    job.status = "Ongoing";
    await job.save();

    res.json({ msg: "Application approved. Job is now Ongoing", application });
  } catch (err) {
    res.status(500).json({ msg: "Error approving application", error: err.message });
  }
};

// Mark job completed
exports.markJobComplete = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.society.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    job.status = "Completed";
    await job.save();

    res.json({ msg: "Job marked as Completed" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating job", error: err.message });
  }
};
