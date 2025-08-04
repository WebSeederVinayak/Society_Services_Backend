const express = require("express");
const router = express.Router();

const { signupAdmin, loginAdmin } = require("../controllers/admin/adminAuth");

// ✅ Alias subscription controller functions to avoid name conflict
const {
  getAllSubscriptions,
  getVendorSubscriptionHistory,
  cancelSubscription
} = require("../controllers/admin/subscriptionController");

const { authenticate, authorizeRoles } = require("../middleware/roleBasedAuth");

const { getVendorsGroupedByRole } = require("../controllers/admin/vendorController");

// ✅ Keep society controller with original names
const {
  approveSociety,
  getPendingSocieties,
  getApprovedSocieties
} = require("../controllers/admin/societyController");

// 🧑‍💼 Admin Auth
router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

// 📊 Vendor List
router.get(
  "/vendors-by-role",
  authenticate,
  authorizeRoles("admin"),
  getVendorsGroupedByRole
);

// 📜 Subscription History Access
router.get(
  "/all-subscriptions",
  authenticate,
  authorizeRoles("admin"),
  getAllSubscriptions
);

router.get(
  "/vendor-subscription-history/:vendorId",
  authenticate,
  authorizeRoles("admin"),
  getVendorSubscriptionHistory
);

router.patch(
  "/cancel-subscription/:subscriptionId",
  authenticate,
  authorizeRoles("admin"),
  cancelSubscription
);

// 🏢 Society Approval Routes
router.patch(
  "/approve-society/:societyId",
  authenticate,
  authorizeRoles("admin"),
  approveSociety
);

router.get(
  "/pending-societies",
  authenticate,
  authorizeRoles("admin"),
  getPendingSocieties
);

router.get(
  "/approved-societies",
  authenticate,
  authorizeRoles("admin"),
  getApprovedSocieties
);

module.exports = router;
