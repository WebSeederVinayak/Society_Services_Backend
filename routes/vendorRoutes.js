const express = require("express");
const router = express.Router();
const {
  loginVendor,
  signupVendor,
  createVendorProfile,
} = require("../controllers/vendor/vendorAuth");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/roleBasedAuth");
const uploadIDProof = require("../middlewares/uploadIDProof");

router.post("/signup", signupVendor);
router.post("/login", loginVendor);

router.put(
  "/createProfile",
  authenticate,
  authorizeRoles("vendor"),
  uploadIDProof,
  createVendorProfile
);

module.exports = router;
