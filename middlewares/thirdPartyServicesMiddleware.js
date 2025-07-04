const Vendor = require("../models/vendorSchema");

exports.validateOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const vendor = await Vendor.findOne({ email }).select("otp");
    if (!vendor) return res.status(400).json({ msg: "Vendor not found" });

    if (vendor.otp != otp) {
      res.otpValidationResult = false;
    } else {
      res.otpValidationResult = true;
    }
    next();
  } catch (err) {
    res.otpValidationResult = false;
    res.validationError = err;
  }
};
