const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL || "mongodb://mongodb:27017/productdb";

async function connectDatabase() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
}

function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? "ok" : "error";
}

module.exports = {
  connectDatabase,
  getDatabaseStatus,
  mongoose
};
