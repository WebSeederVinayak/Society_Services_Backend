const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // ✅ Added cors

const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const societyRoutes = require("./routes/societyRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://social-services-app.vercel.app",
];

app.use(
  cors({ origin: "*", methods: "*", allowedHeaders: "*", credentials: true })
);

// Middleware
app.use(express.json());

// Swagger API docs
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerOptions");

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Velnor API");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/society", societyRoutes);
app.use("/api/jobs", jobRoutes);               // POST /api/jobs/create, GET /api/jobs/nearby
app.use("/api/applications", applicationRoutes); // POST /api/applications/:id/apply

// Connect to MongoDB
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
