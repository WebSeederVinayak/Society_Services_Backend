const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getJobApplicants,
  getApplicationsByStatus, // ✅ import new controller
} = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Vendor applies to a job (quotation or direct)
router.post("/:id/apply", authMiddleware, applyToJob);

// Society views all applicants for a job
router.get("/:id/applicants", authMiddleware, getJobApplicants);

// ✅ NEW: Vendor gets their applications filtered by status
router.get("/status/:status", authMiddleware, getApplicationsByStatus);

module.exports = router;
