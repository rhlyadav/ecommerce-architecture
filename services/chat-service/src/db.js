const mongoose = require("mongoose");

let databaseState = "disconnected";

async function connectDatabase() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/chatdb";

  mongoose.connection.on("connected", () => {
    databaseState = "ok";
  });

  mongoose.connection.on("disconnected", () => {
    databaseState = "disconnected";
  });

  mongoose.connection.on("error", () => {
    databaseState = "error";
  });

  await mongoose.connect(mongoUrl);
  databaseState = "ok";
}

function getDatabaseStatus() {
  return databaseState;
}

module.exports = {
  connectDatabase,
  getDatabaseStatus
};
