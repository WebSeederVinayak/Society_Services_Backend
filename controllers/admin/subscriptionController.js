// controllers/admin/subscriptionController.js
let currentPrice = 0;

exports.setSubscriptionPrice = (req, res) => {
  const { price } = req.body;
  if (!price) return res.status(400).json({ message: "Price is required" });

  currentPrice = price;
  res.status(200).json({ message: "Price updated", price });
};

exports.getSubscriptionPrice = (req, res) => {
  res.status(200).json({ price: currentPrice });
};

exports.getCurrentPriceValue = () => currentPrice;
