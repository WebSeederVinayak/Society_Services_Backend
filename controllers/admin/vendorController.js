const Vendor = require("../../models/vendorSchema");

exports.getVendorsGroupedByRole = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).lean();

    const grouped = {};

    vendors.forEach(vendor => {
      vendor.services.forEach(role => {
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(vendor);
      });
    });

    res.json({ success: true, groupedByRole: grouped });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
