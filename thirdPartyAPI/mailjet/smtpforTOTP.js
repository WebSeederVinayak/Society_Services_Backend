/**
 *
 * Run:
 *
 */
require("dotenv").config();
const Mailjet = require("node-mailjet");
const crypto = require("crypto");

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_SECRET,
});

exports.sendOTP = (vendorName, otp, vendorEmail) => {
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MJ_SENDER_EMAIL, // Use your Mailjet public API key as sender email
          Name: process.env.MJ_SENDER_NAME, // Use your Mailjet public API key as sender name
        },
        To: [
          {
            Email: vendorEmail, // Vendor's email address
            Name: vendorName, // Vendor's name
          },
        ],
        Subject: "Velnor OTP Verification( Development Phase )",
        TextPart: "Greetings from Velnor!",
        HTMLPart:
          "<h3>Hello " +
          vendorName +
          ', welcome to <a href="https://www.webseeders.in/">Velnor</a>!</h3><br />Hope you are doing well.<br/> This is your OTP for verification: ' +
          otp,
      },
    ],
  });
  const retVal = true;
  request
    .then((result) => {
      const status = result.body.Messages[0].Status;
      console.log("Mail status:", status);
    })
    .catch((err) => {
      retVal = false;
      console.log(err.statusCode);
    });
  return retVal;
};

exports.generate4DigitOtp = (vendorName) => {
  const timestamp = Math.floor(Date.now() / (1000 * 30)); // changes every 30 seconds
  const raw = `${vendorName}-${process.env.TOTP_GENERATION_SECRET}-${timestamp}`;

  const hash = crypto.createHash("sha256").update(raw).digest("hex");

  // Extract digits and slice the first 4 digits
  const digitsOnly = hash.replace(/\D/g, "");
  if (digitsOnly.length >= 4) {
    return digitsOnly.slice(0, 4);
  }

  // Fallback: convert hash to number and mod it to get 4 digits
  const fallback = parseInt(hash.slice(0, 8), 16) % 10000;
  return fallback.toString().padStart(4, "0");
};
