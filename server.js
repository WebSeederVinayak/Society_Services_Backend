const express = require("express");
const PORT = process.env.PORT || 5003;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { prototype } = require("nodemailer/lib/dkim");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to Velnor API");
});
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/vendor", require("./routes/vendorRoutes"));
app.use("/api/society", require("./routes/societyRoutes"));
app.use("/jobs", jobRoutes);
app.use("/jobs", applicationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
