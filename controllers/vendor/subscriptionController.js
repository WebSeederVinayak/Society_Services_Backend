const Subscription = require("../../models/Subscription");
const Vendor = require("../../models/vendorSchema");
const { sendSubscriptionEmail } = require("../../utils/notify");

// ✅ Vendor: Purchase Subscription (Simulated Payment Flow with Dynamic Price)
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

    // ✅ Dynamic price calculation
    const numberOfServices = vendor.services.length;
    const totalPrice = basePrice * numberOfServices;

    // ✅ Mark all previous subscriptions as inactive and expired
    await Subscription.updateMany(
      { vendor: vendorId },
      {
        isActive: false,
        subscriptionStatus: "Expired",
      }
    );

    // ✅ Create new subscription
    const newSubscription = await Subscription.create({
      vendor: vendorId,
      vendorName: vendor.name,
      vendorReferenceId: vendor.vendorReferenceId,
      planPrice: totalPrice,
      startDate,
      endDate,
      paymentStatus: "Paid", // Simulated
      subscriptionStatus: "Active",
      isActive: true,
    });
    
    // ✅ Send subscription confirmation email
    await sendSubscriptionEmail(
      vendor.email,
      "Subscription Activated 🎉",
      `Hi ${vendor.name},

    Your subscription has been successfully activated for 1 year.
    Reference ID: ${vendor.vendorReferenceId}
    Total Price: ₹${basePrice} × ${numberOfServices} = ₹${totalPrice}
    Expires On: ${endDate.toDateString()}

    Thank you for subscribing!

    Team Velre`
    );

    res.status(201).json({
      message: `Subscription activated. ₹${basePrice} × ${numberOfServices} services = ₹${totalPrice}`,
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
