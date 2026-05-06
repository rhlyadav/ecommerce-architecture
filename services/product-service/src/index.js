const express = require("express");
const cors = require("cors");

// Import modules
const { connectDatabase, getDatabaseStatus } = require("./db");
const { Product, seedProducts } = require("./models");
const { connectRedis, publishProductCreatedEvent } = require("./events");

const app = express();
const port = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", async (_req, res) => {
  const state = getDatabaseStatus();
  const status = state === "ok" ? 200 : 500;
  res.status(status).json({ service: "product-service", status: state });
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const product = await Product.create({ name, price, description });
    await publishProductCreatedEvent(product);
    return res.status(201).json(product);
  } catch (error) {
    console.error("Failed to create product", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Server initialization
async function start() {
  try {
    console.log("Starting product-service...");
    
    await connectDatabase();
    await connectRedis();
    await seedProducts();

    app.listen(port, () => {
      console.log(`product-service listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start product-service", error);
    process.exit(1);
  }
}

start();
