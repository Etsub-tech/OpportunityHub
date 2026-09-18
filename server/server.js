require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// --- Middleware that runs on EVERY request, in this order ---
app.use(cors({ origin: process.env.CLIENT_URL })); // only our React app's origin may call this API
app.use(express.json()); // parses incoming JSON bodies into req.body

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);

// --- Error handling (must be registered LAST, after all routes) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, and only start accepting requests once that
// succeeds. If the database connection fails, connectDB() exits the process
// (see config/db.js) so we never serve requests we can't actually fulfill.
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
