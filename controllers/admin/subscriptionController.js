const Subscription = require("../../models/Subscription");
const Vendor = require("../../models/vendorSchema");

// ✅ Admin: Get all subscriptions (from all vendors)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({})
      .populate("vendor", "name email phone") // Optional, since vendorName is also stored separately
      .sort({ createdAt: -1 });

    res.status(200).json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error: err.message });
  }
};

// ✅ Admin: Get one vendor's full subscription history
exports.getVendorSubscriptionHistory = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    const history = await Subscription.find({ vendor: vendorId })
      .sort({ startDate: -1 });

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendor history", error: err.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Mark subscription as cancelled and inactive
    subscription.subscriptionStatus = "Cancelled";
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({ message: "Subscription cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel subscription", error: err.message });
  }
};