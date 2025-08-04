const Subscription = require("../../models/Subscription");
const Vendor = require("../../models/vendorSchema");

// ✅ Vendor: Purchase Subscription (Simulated Payment Flow)
exports.purchaseSubscription = async (req, res) => {
  const vendorId = req.user.id;
  const basePrice = 999;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.services || vendor.services.length === 0) {
      return res.status(400).json({
        message: "Vendor not found or no services selected. Please update your profile first.",
      });
    }

    const totalPrice = basePrice * vendor.services.length;

    // Mark all previous subscriptions as inactive and expired
    await Subscription.updateMany(
      { vendor: vendorId },
      {
        isActive: false,
        subscriptionStatus: "Expired",
      }
    );

    // Create new subscription
    const newSubscription = await Subscription.create({
      vendor: vendorId,
      vendorName: vendor.name,
      vendorReferenceId: vendor.vendorReferenceId, // ✅ passed from Vendor
      planPrice: totalPrice,
      startDate,
      endDate,
      paymentStatus: "Paid",             // Simulated
      subscriptionStatus: "Active",
      isActive: true,
    });

    res.status(201).json({
      message: "Subscription successfully activated for 1 year.",
      subscription: newSubscription,
    });
  } catch (err) {
    res.status(500).json({
      message: "Subscription purchase failed",
      error: err.message,
    });
  }
};

// ✅ Vendor: Check Current Subscription Status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      vendor: req.user.id,
      isActive: true,
    });

    if (!subscription) {
      return res.status(200).json({
        isActive: false,
        subscriptionStatus: "None",
        message: "No active subscription found",
      });
    }

    const now = new Date();
    const isStillValid = now <= subscription.endDate;

    if (!isStillValid) {
      subscription.isActive = false;
      subscription.subscriptionStatus = "Expired";
      await subscription.save();
    }

    res.status(200).json({
      isActive: isStillValid,
      subscriptionStatus: isStillValid ? "Active" : "Expired",
      expiresOn: subscription.endDate,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to check subscription",
      error: err.message,
    });
  }
};
