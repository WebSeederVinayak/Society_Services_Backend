const Admin = require("../models/adminSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signupAdmin = async (req, res) => {
  try {
    const { username, email, password, gender, department, subrole } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      username,
      email,
      password: hashed,
      gender,
      department,
      subrole,
    });

    await newAdmin.save();
    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role, subrole: admin.subrole },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, role: admin.role, subrole: admin.subrole });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
