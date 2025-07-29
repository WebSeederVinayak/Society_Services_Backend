const express = require("express");
const router = express.Router();

const { signupAdmin, loginAdmin } = require("../controllers/admin/adminAuth");

const {
  getAllSubscriptions,
  getVendorSubscriptionHistory,
  cancelSubscription  // <-- ✅ Add this here
} = require("../controllers/admin/subscriptionController");

const { authenticate, authorizeRoles } = require("../middleware/roleBasedAuth");

// 🧑‍💼 Admin Auth
router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

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

module.exports = router;
