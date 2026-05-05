const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ service: "user-service", status: "ok" });
  } catch (error) {
    res.status(500).json({ service: "user-service", status: "error", message: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  const user = await prisma.user.create({
    data: { name, email }
  });

  return res.status(201).json(user);
});

async function start() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`user-service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start user-service", error);
    process.exit(1);
  }
}

start();
