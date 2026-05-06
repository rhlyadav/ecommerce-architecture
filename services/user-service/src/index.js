const express = require("express");
const cors = require("cors");

// Import modules
const { connectDatabase, getDatabaseStatus } = require("./db");
const { getAllUsers, createUser } = require("./models");
const { connectRedis, subscribeToProductEvents, getRecentProductEvents } = require("./events");

const app = express();
const port = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", async (_req, res) => {
  try {
    const status = await getDatabaseStatus();
    if (status === "ok") {
      res.json({ service: "user-service", status: "ok" });
    } else {
      res.status(500).json({ service: "user-service", status: "error" });
    }
  } catch (error) {
    res.status(500).json({ service: "user-service", status: "error", message: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/users/activity", (_req, res) => {
  res.json(getRecentProductEvents());
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const user = await createUser(name, email);
    return res.status(201).json(user);
  } catch (error) {
    console.error("Failed to create user", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Server initialization
async function start() {
  try {
    console.log("Starting user-service...");

    await connectDatabase();
    await connectRedis();
    await subscribeToProductEvents();

    app.listen(port, () => {
      console.log(`user-service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start user-service", error);
    process.exit(1);
  }
}

start();
