const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const productEventsChannel = process.env.PRODUCT_EVENTS_CHANNEL || "product-events";
const redisSubscriber = createClient({ url: redisUrl });

const recentProductEvents = [];

async function connectRedis() {
  try {
    await redisSubscriber.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed", error);
    throw error;
  }
}

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

    console.log(`Received product event: ${name}`);
  } catch (error) {
    console.error("Failed to process product event", error);
  }
}

async function subscribeToProductEvents() {
  try {
    await redisSubscriber.subscribe(productEventsChannel, handleProductEvent);
    console.log(`Subscribed to ${productEventsChannel} channel`);
  } catch (error) {
    console.error("Failed to subscribe to product events", error);
    throw error;
  }
}

function getRecentProductEvents() {
  return recentProductEvents;
}

module.exports = {
  connectRedis,
  subscribeToProductEvents,
  getRecentProductEvents
};
