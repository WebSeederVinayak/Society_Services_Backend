const express = require("express");
const router = express.Router();
const { createJob, getNearbyJobs } = require("../controllers/jobController");
const { authMiddleware } = require("../middleware/authMiddleware");

// POST /api/jobs/create
router.post("/create", authMiddleware, createJob);

// GET /api/jobs/nearby?latitude=..&longitude=..
router.get("/nearby", authMiddleware, getNearbyJobs);

// Health check route
router.get("/test", (req, res) => {
  res.send("Job route working");
});

module.exports = router;
