const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const productEventsChannel = process.env.PRODUCT_EVENTS_CHANNEL || "product-events";
const redisPublisher = createClient({ url: redisUrl });

async function connectRedis() {
  try {
    await redisPublisher.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed", error);
    throw error;
  }
}

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
    console.log(`Product created event published for product ${product._id}`);
  } catch (error) {
    console.error("Failed to publish product.created event", error);
  }
}

module.exports = {
  connectRedis,
  publishProductCreatedEvent
};
