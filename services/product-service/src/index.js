const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT || 4002;
const mongoUrl = process.env.MONGO_URL || "mongodb://mongodb:27017/productdb";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const productEventsChannel = process.env.PRODUCT_EVENTS_CHANNEL || "product-events";
const redisPublisher = createClient({ url: redisUrl });

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

async function publishProductCreatedEvent(product) {
  try {
    await redisPublisher.publish(
      productEventsChannel,
      JSON.stringify({
        type: "product.created",
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : new Date().toISOString()
      })
    );
  } catch (error) {
    console.error("Failed to publish product.created event", error);
  }
}

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const state = mongoose.connection.readyState === 1 ? "ok" : "error";
  const status = state === "ok" ? 200 : 500;
  res.status(status).json({ service: "product-service", status: state });
});

app.get("/api/products", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: "name and price are required" });
  }

  const product = await Product.create({ name, price, description });
  publishProductCreatedEvent(product);
  return res.status(201).json(product);
});

async function seedProducts() {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany([
      { name: "Starter Hoodie", price: 59.99, description: "Warm and minimal everyday hoodie." },
      { name: "Architect Desk Lamp", price: 89.5, description: "Clean metal desk lamp for workspaces." }
    ]);
  }
}

async function start() {
  try {
    await mongoose.connect(mongoUrl);
    await redisPublisher.connect();
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
