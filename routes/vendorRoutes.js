const express = require("express");
const router = express.Router();
const {
  loginVendor,
  signupVendor,
  createVendorProfile,
  sendValidationOTP,

  validateOTP,
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

router.post(
  "/sendOtp",

  sendValidationOTP
);

router.get("/validateOtp", validateOTP);
module.exports = router;
