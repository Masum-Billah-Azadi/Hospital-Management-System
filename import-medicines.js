// import-medicines.js
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Medicine = require('./src/models/Medicine.model'); 

require('dotenv').config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI;

async function importData() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found in .env.local file');
        return;
    }
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Database connected.');
        await Medicine.deleteMany({});
        console.log('✅ Existing medicines cleared.');
        
        const results = [];
        // merged_medicines.csv অথবা আপনার চূড়ান্ত ফাইলের নাম দিন
        fs.createReadStream('merged_medicines.csv') 
            .pipe(csv())
            .on('data', (data) => {
                // ===== পরিবর্তন: CSV কলামের নামের সাথে মডেলের ফিল্ড মেলানো হচ্ছে =====
                results.push({
                    brandName: data['brand name'],
                    dosageForm: data['dosage form'],
                    genericName: data['generic'], // CSV-তে কলামের নাম 'generic'
                    strength: data['strength'],
                    packageContainer: data['package container'],
                    manufacturer: data['manufacturer'],
                    indications: data['indications'],
                });
            })
            .on('end', async () => {
                await Medicine.insertMany(results);
                console.log(`✅ ${results.length} medicines have been successfully imported.`);
                mongoose.connection.close();
            });
    } catch (error) {
        console.error('❌ Error during data import:', error);
        mongoose.connection.close();
    }
}

importData();