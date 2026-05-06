const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("redis");

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4001;
const recentProductEvents = [];
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const productEventsChannel = process.env.PRODUCT_EVENTS_CHANNEL || "product-events";
const redisSubscriber = createClient({ url: redisUrl });

function rememberProductEvent(event) {
  recentProductEvents.unshift(event);

  if (recentProductEvents.length > 10) {
    recentProductEvents.length = 10;
  }
}

function handleProductEvent(rawMessage) {
  try {
    const event = JSON.parse(rawMessage);
    const { type, productId, name, price, createdAt } = event;

    if (type !== "product.created" || !productId || !name) {
      console.error("Ignoring invalid product event payload", event);
      return;
    }

    rememberProductEvent({
      type,
      productId,
      name,
      price,
      createdAt,
      receivedAt: new Date().toISOString(),
      summary: `Product "${name}" was created in product-service and received by user-service via Redis.`
    });
  } catch (error) {
    console.error("Failed to process product event", error);
  }
}

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

app.get("/api/users/activity", (_req, res) => {
  res.json(recentProductEvents);
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
    await redisSubscriber.connect();
    await redisSubscriber.subscribe(productEventsChannel, handleProductEvent);
    app.listen(port, () => {
      console.log(`user-service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start user-service", error);
    process.exit(1);
  }
}

start();
