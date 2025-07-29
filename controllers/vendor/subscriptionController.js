const Subscription = require("../../models/Subscription");
const Vendor = require("../../models/vendorSchema");

// ✅ Vendor: Purchase Subscription (Simulated Payment Flow)
exports.purchaseSubscription = async (req, res) => {
  const vendorId = req.user.id;
  const planPrice = 999;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Mark all previous subscriptions as inactive + expired
    await Subscription.updateMany(
      { vendor: vendorId },
      { isActive: false, subscriptionStatus: "Expired" }
    );

    // Create new subscription
    const newSubscription = await Subscription.create({
      vendor: vendorId,
      vendorName: vendor.name,
      planPrice,
      startDate,
      endDate,
      paymentStatus: "Paid",             // Simulated
      subscriptionStatus: "Active",
      isActive: true
    });

    res.status(201).json({
      message: "Subscription successfully activated for 1 year.",
      subscription: newSubscription
    });
  } catch (err) {
    res.status(500).json({ message: "Subscription purchase failed", error: err.message });
  }
};

// ✅ Vendor: Check Current Subscription Status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      vendor: req.user.id,
      isActive: true
    });

    if (!subscription) {
      return res.status(200).json({
        isActive: false,
        subscriptionStatus: "None",
        message: "No active subscription found"
      });
    }

    const now = new Date();
    const isStillValid = now <= subscription.endDate;

    if (!isStillValid) {
      // Auto-update status if expired
      subscription.isActive = false;
      subscription.subscriptionStatus = "Expired";
      await subscription.save();
    }

    res.status(200).json({
      isActive: isStillValid,
      subscriptionStatus: isStillValid ? "Active" : "Expired",
      expiresOn: subscription.endDate
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to check subscription", error: err.message });
  }
};
