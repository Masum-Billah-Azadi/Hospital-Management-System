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
        fs.createReadStream('masum_medicines.csv') 
            .pipe(csv())
            .on('data', (data) => {
                // ===== পরিবর্তন: CSV কলামের নামের সাথে মডেলের ফিল্ড মেলানো হচ্ছে =====
                results.push({
                    brandName: data['Medicine'],
                    dosageForm: data['Type'],
                    genericName: data['Generic'],
                    strength: data['Strength'],
                    packageContainer: data['Price'],
                    manufacturer: data['Brand'],
                    indications: data['Indication'],
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