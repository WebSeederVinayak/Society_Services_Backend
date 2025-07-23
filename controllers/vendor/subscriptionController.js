// controllers/vendor/subscriptionController.js
const Subscription = require("../../models/Subscription");
const { getCurrentPriceValue } = require("../admin/subscriptionController");

exports.purchaseSubscription = async (req, res) => {
  const vendorId = req.user.id;
  const price = getCurrentPriceValue();

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  try {
    let subscription = await Subscription.findOne({ vendor: vendorId });

    if (subscription) {
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.price = price;
      subscription.isActive = true;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        vendor: vendorId,
        price,
        startDate,
        endDate,
      });
    }

    res.status(200).json({
      message: "Subscription active",
      subscription,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ vendor: req.user.id });
    if (!subscription) return res.status(404).json({ isActive: false });

    const now = new Date();
    const isActive = now <= subscription.endDate;
    res.status(200).json({ isActive, expiresOn: subscription.endDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
