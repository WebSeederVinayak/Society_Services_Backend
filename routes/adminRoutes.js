const express = require("express");
const router = express.Router();

const { signupAdmin, loginAdmin } = require("../controllers/admin/adminAuth");
const {
  setSubscriptionPrice,
  getSubscriptionPrice
} = require("../controllers/admin/subscriptionController");

const { authenticate, authorizeRoles } = require("../middleware/roleBasedAuth");

// 🧑‍💼 Admin Auth
router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

// 💸 Subscription Pricing Management
router.post(
  "/set-subscription-price",
  authenticate,
  authorizeRoles("admin"),
  setSubscriptionPrice
);

router.get(
  "/subscription-price",
  authenticate,
  authorizeRoles("admin"),
  getSubscriptionPrice
);

module.exports = router;
