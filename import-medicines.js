// import-medicines.js
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
// পরিবর্তন: .default বাদ দেওয়া হয়েছে
const Medicine = require("./src/models/Medicine.model").default;

require("dotenv").config({ path: ".env.local" });
const MONGODB_URI = process.env.MONGODB_URI;

async function importData() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env.local file");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database connected.");
    await Medicine.deleteMany({});
    console.log("✅ Existing medicines cleared.");

    const results = [];
    // আপনার CSV ফাইলের নাম
    fs.createReadStream("masum_medicines.csv")
      .pipe(csv())
      .on("data", (data) => {
        // ===== পরিবর্তন: Price কলাম থেকে দাম বের করা হচ্ছে =====
        let price = "";
        const priceString = data["Price"]; // CSV থেকে Price কলামের মান
        if (priceString) {
          // Regex দিয়ে "৳" চিহ্নের পরের সংখ্যাটি খোঁজা হচ্ছে
          const priceMatch = priceString.match(/৳\s*([\d,]+\.?\d*)/);
          if (priceMatch && priceMatch[1]) {
            price = priceMatch[1].replace(/,/g, ""); // কমা থাকলে বাদ দেওয়া
          }
        }
        // ================================================

        results.push({
          brandName: data["Medicine"],
          dosageForm: data["Type"],
          genericName: data["Generic"],
          strength: data["Strength"],
          packageContainer: data["Price"], // মূল Price স্ট্রিংটিও রাখা হচ্ছে
          price: price, // বের করা দামটি price ফিল্ডে সেভ করা হচ্ছে
          manufacturer: data["Brand"],
          indications: data["Indication"],
        });
      })
      .on("end", async () => {
        await Medicine.insertMany(results);
        console.log(
          `✅ ${results.length} medicines have been successfully imported.`,
        );
        mongoose.connection.close();
      });
  } catch (error) {
    console.error("❌ Error during data import:", error);
    mongoose.connection.close();
  }
}

importData();
