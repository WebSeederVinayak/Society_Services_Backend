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

/**
 * @swagger
 * /api/vendor/createProfile:
 *   put:
 *     summary: Update vendor profile with personal and business details
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               experience:
 *                 type: integer
 *               phone:
 *                 type: string
 *               services:
 *                 type: string
 *                 example: '["Cleaning","Repair"]'
 *               address:
 *                 type: string
 *                 description: JSON string with buildingNumber, locality, landmark, city, state, pincode
 *                 example: '{"buildingNumber":"C-12","locality":"Cyber Hub","landmark":"DLF Mall","city":"Gurugram","state":"Haryana","pincode":"122001"}'
 *               workingDays:
 *                 type: string
 *                 example: '{"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":false,"sunday":false}'
 *               workingHours:
 *                 type: string
 *                 example: '{"from":"09:00","upto":"18:00"}'
 *               payScale:
 *                 type: string
 *                 example: '{"from":500,"upto":2000}'
 *               location:
 *                 type: string
 *                 example: '{"GeoLocation":{"latitude":28.4595,"longitude":77.0266},"formattedAddress":"Cyber City, Gurugram"}'
 *               paymentMethods:
 *                 type: string
 *                 example: '{"UPI":{"uPIID":"shivam@upi","uPIApp":"PhonePe"},"Card":{"cardType":"Debit","cardNumber":"1111222233334444","cardHolderName":"Shivam Dixit","cardExpiry":"2025-07-01T00:00:00.000Z","cardCVV":"123"}}'
 *               lastPayments:
 *                 type: string
 *                 example: '[{"paymentDate":"2024-01-01","amount":500,"paymentMethod":"UPI","transactionId":"TXN123456","paymentReason":"Subscription","paymentStatus":"Success"}]'
 *               idProof:
 *                 type: string
 *                 format: binary
 *                 description: Upload a PDF or image of your ID
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 */

exports.createVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Parse fields from multipart/form-data
    const updateData = {};

    // Parse JSON string fields safely
    if (req.body.address) {
      try {
        updateData.address = req.body.address;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid address format" });
      }
    }

    if (req.body.services) {
      try {
        updateData.services = req.body.services;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid services format" });
      }
    }

    if (req.body.workingDays) {
      try {
        updateData.workingDays = req.body.workingDays;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid workingDays format" });
      }
    }

    if (req.body.workingHours) {
      try {
        updateData.workingHours = req.body.workingHours;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid workingHours format" });
      }
    }

    if (req.body.payScale) {
      try {
        updateData.payScale = req.body.payScale;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payScale format" });
      }
    }

    if (req.body.location) {
      try {
        updateData.location = req.body.location;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location format" });
      }
    }

    if (req.body.paymentMethods) {
      try {
        updateData.paymentMethods = req.body.paymentMethods;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid paymentMethods format" });
      }
    }

    if (req.body.lastPayments) {
      try {
        updateData.lastPayments = req.body.lastPayments;
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid lastPayments format" });
      }
    }

    // Handle normal string/integer fields
    if (req.body.businessName) updateData.businessName = req.body.businessName;
    if (req.body.experience)
      updateData.experience = Number(req.body.experience);
    if (req.body.phone) updateData.phone = req.body.phone;

    // Handle file (PDF) via Multer
    updateData.idProof = "uploads/" + req.file.uniqueName;
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
