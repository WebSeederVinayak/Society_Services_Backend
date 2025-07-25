const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getJobApplicants,
  approveApplication,
  markJobComplete,
} = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/:id/apply", authMiddleware, applyToJob);
router.get("/:id/applicants", authMiddleware, getJobApplicants);

// ✅ New routes
router.post("/:applicationId/approve", authMiddleware, approveApplication);
router.post("/job/:jobId/complete", authMiddleware, markJobComplete);

module.exports = router;
