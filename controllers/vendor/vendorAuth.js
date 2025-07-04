const Vendor = require("../../models/vendorSchema");
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
      { id: newVendor._id, role: newVendor.role },
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
    const vendorId = req.user.id;

    // Parse fields from multipart/form-data
    const updateData = {};

    // Parse JSON string fields safely
    if (req.body.address) {
      updateData.address = req.body.address;
    }

    if (req.body.services) {
      updateData.services = req.body.services;
    }

    if (req.body.workingDays) {
      updateData.workingDays = req.body.workingDays;
    }

    if (req.body.workingHours) {
      updateData.workingHours = req.body.workingHours;
    }

    if (req.body.payScale) {
      updateData.payScale = req.body.payScale;
    }

    if (req.body.location) {
      updateData.location = req.body.location;
    }

    if (req.body.paymentMethods) {
      updateData.paymentMethods = req.body.paymentMethods;
    }

    if (req.body.lastPayments) {
      updateData.lastPayments = req.body.lastPayments;
    }

    // Handle normal string/integer fields
    if (req.body.businessName) updateData.businessName = req.body.businessName;
    if (req.body.experience)
      updateData.experience = Number(req.body.experience);
    if (req.body.phone) updateData.phone = req.body.phone;

    // Handled  file (PDF) via Multer in the middleware
    updateData.idProof = "uploads/" + req.body.uniqueName;
    // Update vendor in DB
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
      // data: updatedVendor, // Uncomment if needed for frontend
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

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Vendor not found" });
    const token = jwt.sign(
      { id: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ msg: "Password reset link sent", resetToken: token });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
