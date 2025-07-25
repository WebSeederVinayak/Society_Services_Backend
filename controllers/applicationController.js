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

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const application = new Application({
      job: jobId,
      vendor: req.user.id,
      message,
      applicationType,
      status: "approval pending",
    });

    if (applicationType === "quotation") {
      application.quotedPrice = quotedPrice;
      application.estimatedTime = estimatedTime;
      application.additionalNotes = additionalNotes;
    }

    // Update job status to "Applied"
    job.status = "Applied";
    await job.save();

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

// 5. Society approves an application and job becomes ongoing
exports.approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate("job");
    if (!application) return res.status(404).json({ msg: "Application not found" });

    if (application.job.society.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    application.status = "approved";
    await application.save();

    application.job.status = "Ongoing";
    await application.job.save();

    res.json({ msg: "Application approved. Job is now Ongoing", application });
  } catch (err) {
    res.status(500).json({ msg: "Error approving application", error: err.message });
  }
};

// 6. Society marks a job as completed
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
