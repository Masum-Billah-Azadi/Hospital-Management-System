// src/models/PatientProfile.model.js
import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
    // রোগীর নিজের User ID, যা User মডেলের সাথে লিঙ্ক করা
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // রোগীকে দেখা সব ডাক্তারদের User ID-এর তালিকা
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // রোগীর মেডিকেল তথ্য
    age: {
    type: String,
    },

    // **নতুন:** লিঙ্গ (Gender)
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // নির্দিষ্ট মান সেট করা ভালো
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
    // **নতুন:** রোগ নির্ণয়ের ইতিহাস
    diagnosis: {
        type: String,
    },
    // **নতুন:** আপলোড করা রিপোর্টের তালিকা
    reports: [{
        fileName: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
}, {
    timestamps: true,
    collection: 'patientprofiles',
});

export default mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema);