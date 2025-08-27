// src/models/PatientProfile.model.js
import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
    // রোগীর নিজের User ID, যা User মডেলের সাথে লিঙ্ক করা
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // রোগীকে দেখা সব ডাক্তারদের User ID-এর তালিকা
    doctors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    // রোগীর মেডিকেল তথ্য
    age: {
        type: Number,
    },
    height: {
        type: String, // যেমন: "5' 8\""
    },
    weight: {
        type: String, // যেমন: "70 kg"
    },
    bloodPressure: {
        type: String, // যেমন: "120/80 mmHg"
    },
    // আমরা পরে এখানে Prescription এবং Report-এর তথ্য যোগ করব
}, {
    timestamps: true,
});

export default mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema);