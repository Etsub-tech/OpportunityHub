const mongoose = require("mongoose");

// Connects to MongoDB using the URI from .env.
// We separate this into its own function so server.js doesn't get cluttered,
// and so we can call it once at startup and fail loudly if it doesn't work.
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Exit the process — there's no point running an API that can't reach its database.
    process.exit(1);
  }
}

module.exports = connectDB;
