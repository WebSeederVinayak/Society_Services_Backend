const express = require("express");
const router = express.Router();
const {
  signupSociety,
  loginSociety,
} = require("../controllers/society/societyAuth");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/roleBasedAuth");
router.post("/signup", signupSociety);
router.post("/login", loginSociety);

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("society"),
  (req, res) => {
    res.json({ msg: "Welcome to Society Dashboard", user: req.user });
  }
);

module.exports = router;
