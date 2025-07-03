const express = require("express");
const router = express.Router();
const {
  loginVendor,
  signupVendor,
  createVendorProfile,
} = require("../controllers/vendorAuth");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/roleBasedAuth");
router.post("/signup", signupVendor);
router.post("/login", loginVendor);
router.put(
  "/createProfile",
  authenticate,
  authorizeRoles("vendor"),
  createVendorProfile
);

module.exports = router;
