const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const societyRoutes = require("./routes/societyRoutes");
const swaggerSpec = require("./swaggerOptions");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://social-services-app.vercel.app",
  "https://delightful-pastelito-988e6f.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'authToken'],
  })
);

// ✅ Body Parsing Middleware
app.use(express.json({ limit: "10mb" })); // For base64-encoded images
app.use(express.urlencoded({ extended: true })); // Handles form-urlencoded if needed

// ✅ Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Root Health Check
app.get("/", (req, res) => {
  res.send("Welcome to Velnor API");
});

// ✅ Routes
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/society", societyRoutes);
app.use("/api/jobs", jobRoutes);               // e.g. POST /api/jobs/create, GET /api/jobs/nearby
app.use("/api/applications", applicationRoutes); // e.g. POST /api/applications/:id/apply

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
