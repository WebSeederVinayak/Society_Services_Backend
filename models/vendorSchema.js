const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, //done
    businessName: { type: String, default: "Not Given" }, //done
    profilePicture: { type: String, default: "AWSDefaultVendor.jpg" }, //done
    email: {
      type: String,
      required: true,
      unique: true,
    }, //done
    isVerified: { type: Boolean, default: false },
    password: { type: String, required: true }, //done
    otp: { type: String },
    address: {
      buildingNumber: { type: String, default: "Not Given" },
      locality: { type: String, default: "Not Given" },
      landmark: { type: String, default: "Not Given" },
      city: { type: String, default: "Not Given" },
      state: { type: String, default: "Not Given" },
      pincode: { type: String, default: "000000" },
    },

    idProof: {
      type: String,
    },
    workingDays: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    workingHours: {
      from: { type: String, default: "09:00" },
      upto: { type: String, default: "18:00" }, // I have used 24 hours format
    },
    experience: {
      type: Number,
      default: 0,
    },
    phone: { type: String, default: "Not Given" },

    payScale: {
      from: { type: Number, default: 0 },
      upto: { type: Number, default: 0 },
    },
    // quotation:{ }, // Need to discuss with sir regarding quatation type boolean or number or is quation by vendor or for job
    services: [{ type: String }],
    location: {
      GeoLocation: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
      },
      formattedAddress: {
        type: String,
        default: "Not Given",
      },
    },
    paymentMethods: {
      UPI: {
        uPIID: { type: String, default: "Not Given" },
        uPIApp: { type: String, default: "Not Given" }, // e.g. Google Pay, PhonePe, etc.
      },
      Card: {
        cardType: {
          type: String,
          enum: ["Credit", "Debit"],
          default: "Credit",
        },
        cardNumber: { type: String, default: "Not Given" },
        cardHolderName: { type: String, default: "Not Given" },
        cardExpiry: { type: Date, default: null },
        cardCVV: { type: String, default: "Not Given" }, // CVV is usually 3 digits
      },
    },
    lastPayments: [
      {
        paymentDate: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        paymentMethod: {
          type: String,
          enum: ["UPI", "Credit", "Debit"],
          default: "UPI",
        }, // UPI or Card
        transactionId: { type: String, default: "Not Given" },
        paymentReason: {
          type: String,
          default: "Payment for Velre Subscription",
        },
        paymentStatus: {
          type: String,
          enum: ["Success", "Failed", "Pending"],
          default: "Success",
        },
      },
    ],
    role: {
      type: String,
      default: "vendor",
      immutable: true,
    },
    jobHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],

    subscription: {
      isActive: { type: Boolean, default: false },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
