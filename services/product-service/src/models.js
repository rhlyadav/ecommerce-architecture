const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

async function seedProducts() {
  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      await Product.insertMany([
        { name: "Starter Hoodie", price: 59.99, description: "Warm and minimal everyday hoodie." },
        { name: "Architect Desk Lamp", price: 89.5, description: "Clean metal desk lamp for workspaces." }
      ]);
      console.log("Products seeded successfully");
    }
  } catch (error) {
    console.error("Failed to seed products", error);
    throw error;
  }
}

module.exports = {
  Product,
  seedProducts
};
