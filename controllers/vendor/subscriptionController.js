const Subscription = require("../../models/Subscription");

exports.purchaseSubscription = async (req, res) => {
  const vendorId = req.user.id;
  const price = 999;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  try {
    // Mark all previous subscriptions as inactive
    await Subscription.updateMany({ vendor: vendorId }, { isActive: false });

    // Create new subscription
    const newSubscription = await Subscription.create({
      vendor: vendorId,
      price,
      startDate,
      endDate,
      isActive: true
    });

    res.status(201).json({
      message: "Subscription successfully activated for 1 year.",
      subscription: newSubscription
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// ✅ Add this missing export
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      vendor: req.user.id,
      isActive: true
    });

    if (!subscription) {
      return res.status(200).json({ isActive: false });
    }

    const now = new Date();
    const isStillValid = now <= subscription.endDate;

    res.status(200).json({
      isActive: isStillValid,
      expiresOn: subscription.endDate
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
