const express = require("express");
const router = express.Router();
const { applyToJob, getJobApplicants } = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Vendor applies to a job (quotation or direct)
router.post("/:id/apply", authMiddleware, applyToJob);

// Society views all applicants for a job
router.get("/:id/applicants", authMiddleware, getJobApplicants);

module.exports = router;
