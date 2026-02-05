// create-index.js
const mongoose = require("mongoose");
const Medicine = require("./src/models/Medicine.model").default;

require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function createSearchIndex() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connected.");

    console.log("⏳ Creating text index...");

    // brandName এবং genericName এর ওপর টেক্সট ইনডেক্স তৈরি করা হচ্ছে
    await Medicine.collection.createIndex({
      brandName: "text",
      genericName: "text",
    });

    console.log("✅ Text Index successfully created!");
  } catch (error) {
    console.error("❌ Error creating index:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed.");
  }
}

createSearchIndex();
