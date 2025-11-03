// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
    // Medicine Name
    brandName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // TYPE of the medicine
    dosageForm: {
        type: String,
        trim: true,
    },
    // Generic Name
    genericName: {
        type: String,
        trim: true,
    },
    // Strength of the medicine
    strength: {
        type: String,
        trim: true,
    },
    // Package Description (including price text)
    packageContainer: {
        type: String,
        trim: true,
    },
    // Price of the medicine (extracted numeric value)
    price: {
        type: String, // Keep as String for now, can be parsed later
        trim: true,
    },
    // Brand Manufacturer
    manufacturer: {
        type: String,
        trim: true,
    },
    indications: {
        type: String,
        trim: true,
        index: true
    },

    // ===== নতুন ফিল্ডগুলো যোগ করা হয়েছে =====
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0 // ডিফল্ট মান ০
    },
    efficacy: { // কার্যকারিতা
        type: String,
        trim: true,
        default: '' // ডিফল্ট মান খালি স্ট্রিং
    },
    sideEffects: { // পার্শ্বপ্রতিক্রিয়া
        type: String,
        trim: true,
        default: '' // ডিফল্ট মান খালি স্ট্রিং
    },
});


export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
// module.exports = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema); // ইম্পোর্টের সময় এটি ব্যবহার করবেন