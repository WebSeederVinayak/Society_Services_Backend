const express = require("express");
const router = express.Router();

const {
  createJob,
  getNearbyJobs,
  getJobById,
  getMyPostedJobs
} = require("../controllers/jobController");

const { authMiddleware } = require("../middleware/authMiddleware");

// 🔹 POST: Create Job
router.post("/create", authMiddleware, createJob);

// 🔹 GET: Jobs near vendor
router.get("/nearby", authMiddleware, getNearbyJobs);

// 🔹 GET: View Single Job Details (Society/Vendor)
router.get("/:id", authMiddleware, getJobById);

// 🔹 GET: Get all jobs posted by the society
router.get("/my/posted", authMiddleware, getMyPostedJobs);

// 🔹 Health check
router.get("/test", (req, res) => {
  res.send("Job route working");
});

module.exports = router;
