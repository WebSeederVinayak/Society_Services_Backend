const express = require("express");
const router = express.Router();
const { createJob, getNearbyJobs } = require("../controllers/jobController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createJob);
router.get("/nearby", authMiddleware, getNearbyJobs);

router.get("/test", (req, res) => {
  res.send("Job route working");
});


module.exports = router;
