require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { startIngestionJob } = require("./jobs/ingestionJob");

const app = express();

// --- Middleware that runs on EVERY request, in this order ---
app.use(cors({ origin: process.env.CLIENT_URL })); // only our React app's origin may call this API
app.use(express.json()); // parses incoming JSON bodies into req.body

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// --- Error handling (must be registered LAST, after all routes) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, and only start accepting requests once that
// succeeds. If the database connection fails, connectDB() exits the process
// (see config/db.js) so we never serve requests we can't actually fulfill.
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // Only run the real ingestion job automatically outside of tests - we
  // never want a test run silently hitting a live external API.
  if (process.env.NODE_ENV !== "test" && process.env.ENABLE_INGESTION_JOB !== "false") {
    startIngestionJob();
  }
});
