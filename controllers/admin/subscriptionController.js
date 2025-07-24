const Subscription = require("../../models/Subscription");
const Vendor = require("../../models/vendorSchema");

// ✅ Admin: Get all subscriptions (from all vendors)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({})
      .populate("vendor", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error: err.message });
  }
};

// ✅ Admin: Get one vendor's full history
exports.getVendorSubscriptionHistory = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const history = await Subscription.find({ vendor: vendorId }).sort({ startDate: -1 });

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendor history", error: err.message });
  }
};
