const Vendor = require("../../models/vendorSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nonVerified = require("../../models/notVerified");

const {
  sendOTP,
  generate4DigitOtp,
} = require("../../thirdPartyAPI/nodeMailerSMTP/smtpforTOTP");

exports.signupVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await nonVerified.findOne({ email }).select("isVerified");
    if (!existing || !existing.isVerified) {
      return res.status(400).json({ msg: "First please verify the user" });
    }
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
      process.env.JWT_SECRET
    );

    await newVendor.save();
    await existing.deleteOne();
    res
      .status(201)
      .json({ authToken: token, msg: "Vendor registered successfully " });
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
      process.env.JWT_SECRET
    );

    res.json({
      authToken: token,
      role: vendor.role,
      user: {
        isProfileCompleted: vendor.isProfileCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.sendValidationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const generatedOTP = await generate4DigitOtp(email);
    // const vendor = await Vendor.find({ email });
    if (req.notVerified) {
      //otp for newVendorVerification
      var response = await sendOTP("no Name", generatedOTP, email);
      if (response) {
        const notVerifiedVendor = await nonVerified.findOne({ email });
        if (notVerifiedVendor) {
          notVerifiedVendor.otp = generatedOTP;
          notVerifiedVendor.lastOTPSend = new Date();
          await notVerifiedVendor.save();
        } else {
          await nonVerified.create({
            email,
            otp: generatedOTP,
          });
        }
        return res.json({ status: false, msg: "Not Verified Vendor OTP Send" });
      } else {
        return res.status(401).json({ status: false, msg: "email not send" });
      }
    } else {
      // otp for forgetPassword
      const updatedVendor = await Vendor.findOneAndUpdate(
        { email: email }, // Filter by email
        { $set: { otp: generatedOTP } }, // Update only 'name'
        { new: true } // Return the updated document
      ).select("name");
      if (!updatedVendor) {
        return res.status(404).json({ status: false, msg: "Vendor not found" });
      }
      var response = await sendOTP(updatedVendor.name, generatedOTP, email);
      console.log("OTP sent response:", response);
    }
    if (response) {
      res.json({
        status: true,
        msg: "OTP sent to your email",
        vendorName: updatedVendor.name,
      });
    } else {
      res.status(500).json({
        status: false,
        msg: "Failed to send OTP, please try again later",
      });
    }
  } catch (err) {
    res.status(503).json({ msg: "Server error", error: err.message });
  }
};

exports.validateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (res.otpValidationResult) {
      // If OTP is valid, clear it
      console.log("otpValidationResult is true");
      const vendor = await Vendor.findOne({ email });

      vendor.otp = null;
      vendor.isVerified = true;
      await vendor.save();
      res.json({
        status: true,
        msg: "Email validated successfully",
      });
    } else if (res.nonVerifiedUserValid) {
      console.log("nonVerifiedUserValid is true");

      res.json({
        status: true,
        email,
        msg: "New Vendor Verified , please Make Signup Now",
      });
    } else {
      return res.status(400).json({ status: false, msg: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in validateEmail:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.createVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Parse fields from multipart/form-data
    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }

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

    if (req.body.location) {
      updateData.location = req.body.location;
    }

    if (req.body.paymentMethods) {
      updateData.paymentMethods = req.body.paymentMethods;
    }

    if (req.body.lastPayments) {
      updateData.lastPayments = req.body.lastPayments;
    }

    if (req.idProofFile) {
      updateData.idProof = req.idProofFile.path;
    }

    // Handle normal string/integer fields
    if (req.body.businessName) updateData.businessName = req.body.businessName;
    if (req.body.experience)
      updateData.experience = Number(req.body.experience);
    if (req.body.phone) updateData.phone = req.body.phone;

    // Handled  file (PDF) via Multer in the middleware
    updateData.idProof = "uploads/" + req.body.uniqueName;
    updateData.isProfileCompleted = true;
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

    res.status(201).json({
      success: true,
      idProof: req.idProofFile ? { ...req.idProofFile } : "No File Sent",
      message: "Vendor profile updated successfully!!",
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
    if (res.otpValidationResult) {
      const { email, newPassword } = req.body;
      const vendor = await Vendor.findOne({ email });
      vendor.otp = null;
      vendor.password = await bcrypt.hash(newPassword, 10);
      await vendor.save();
      res.json({ msg: "Password Reset Successfull" });
    } else {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
