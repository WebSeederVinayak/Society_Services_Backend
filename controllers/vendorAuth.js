const Vendor = require("../models/vendorSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signupVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Vendor already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      name,
      email,
      password: hashed,
      // companyName,
      // payScale,
      // services,
    });
    const token = jwt.sign(
      { id: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    await newVendor.save();
    res
      .status(201)
      .json({ authToken: token, msg: "Vendor registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ authToken: token, role: vendor.role });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.createVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id; // Adjust based on your auth
    const {
      services,
      businessName,
      address,
      idProof,
      workingDays,
      workingHours,
      experience,
      payScale,
      location,
      paymentMethods,
      lastPayments,
    } = req.body;

    const updateData = {
      ...(services && { services }),
      ...(businessName && { businessName }),
      ...(address && { address }),
      ...(idProof && { idProof }),
      ...(workingDays && { workingDays }),
      ...(workingHours && { workingHours }),
      ...(experience !== undefined && { experience }),
      ...(payScale && { payScale }),
      ...(location && { location }),
      ...(paymentMethods && { paymentMethods }),
      ...(lastPayments && { lastPayments }),
    };

    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
