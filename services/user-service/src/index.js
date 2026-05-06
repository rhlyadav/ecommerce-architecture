const express = require("express");
const cors = require("cors");

// Import modules
const { connectDatabase, getDatabaseStatus } = require("./db");
const { getAllUsers, createUser, findUserByEmail } = require("./models");
const { connectRedis, subscribeToProductEvents, getRecentProductEvents } = require("./events");
const { hashPassword, comparePassword, buildAuthResponse } = require("./auth");
const { requireAuth } = require("./middleware");

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

app.get("/api/users/activity", requireAuth, (_req, res) => {
  res.json(getRecentProductEvents());
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(req.auth.user);
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "A user with that email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });
    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    console.error("Failed to register user", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matches = await comparePassword(password, user.passwordHash);

    if (!matches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json(
      buildAuthResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
    );
  } catch (error) {
    console.error("Failed to login", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "A user with that email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });
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
