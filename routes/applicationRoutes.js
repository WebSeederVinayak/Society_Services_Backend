const express = require("express");
const router = express.Router();

const {
  applyToJob,
  showInterestInJob,
  getJobApplicants,
  approveApplication,
  markJobComplete,
  getVendorApplicationType
} = require("../controllers/applicationController");

const { authMiddleware } = require("../middleware/authMiddleware");

// 🔹 Apply with Quotation or Direct
router.post("/:id/apply", authMiddleware, applyToJob);

// 🔹 Show Interest (button click)
router.post("/:id/interest", authMiddleware, showInterestInJob);

// 🔹 Society: View All Applicants
router.get("/:id/applicants", authMiddleware, getJobApplicants);

// ✅ Approve Application
router.post("/:applicationId/approve", authMiddleware, approveApplication);

// ✅ Mark Job Complete
router.post("/job/:jobId/complete", authMiddleware, markJobComplete);

// 🔹 Society: View if Vendor Applied or Showed Interest
router.get("/:jobId/vendor/:vendorId", authMiddleware, getVendorApplicationType);

module.exports = router;
