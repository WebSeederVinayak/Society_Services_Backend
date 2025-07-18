const express = require("express");
const router = express.Router();
const { applyToJob, getJobApplicants } = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/:id/apply", authMiddleware, applyToJob);
router.get("/:id/applicants", authMiddleware, getJobApplicants);

module.exports = router;
