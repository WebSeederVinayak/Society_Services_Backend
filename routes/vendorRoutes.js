const express = require("express");
const router = express.Router();

const {
  loginVendor,
  signupVendor,
  createVendorProfile,
  sendValidationOTP,
  validateEmail,
  forgetPassword,
} = require("../controllers/vendor/vendorAuth");

const {
  purchaseSubscription,
  checkSubscriptionStatus,
  viewMySubscriptions,       // ✅ NEW (if implemented)
  cancelCurrentSubscription  // ✅ NEW (if implemented)
} = require("../controllers/vendor/subscriptionController");

const {
  applyToJob,
  getJobApplicants,
} = require("../controllers/applicationController"); // ✅ NEW

const { validateOTP } = require("../middleware/thirdPartyServicesMiddleware");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/roleBasedAuth");

const uploadIDProof = require("../middleware/uploadIDProof");
const { signUpNotVerified } = require("../controllers/notVerifiedAuth");

// 🔐 Auth & Profile
router.post("/signup", signupVendor);
router.post("/login", loginVendor);

router.put(
  "/createProfile",
  authenticate,
  authorizeRoles("vendor"),
  uploadIDProof,
  createVendorProfile
);

// 📧 OTP & Email Verification
router.post("/sendOtpEmailVerification", signUpNotVerified, sendValidationOTP);
router.post("/sendOTP", sendValidationOTP);
router.post("/validateEmail", validateOTP, validateEmail);
router.post("/forgetPassword", validateOTP, forgetPassword);

// 💳 Subscription
router.post(
  "/subscribe",
  authenticate,
  authorizeRoles("vendor"),
  purchaseSubscription
);

router.get(
  "/subscription-status",
  authenticate,
  authorizeRoles("vendor"),
  checkSubscriptionStatus
);

// 📩 Vendor applies to job (interest or quotation)
router.post(
  "/jobs/:id/apply",
  authenticate,
  authorizeRoles("vendor"),
  applyToJob
);

// 🧑‍💼 Society gets all applicants for a job
router.get(
  "/jobs/:id/applicants",
  authenticate,
  authorizeRoles("society"),
  getJobApplicants
);

module.exports = router;
