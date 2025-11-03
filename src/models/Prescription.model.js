// src/models/Prescription.model.js
import mongoose from 'mongoose';

// প্রতিটি মেডিসিনের জন্য একটি সাব-স্কিমা
const MedicationSchema = new mongoose.Schema({
  medicationName: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String, // যেমন: "500mg"
    trim: true,
  },
  // ===== পরিবর্তন শুরু =====
  frequency: {
    type: String, // যেমন: "1+0+1"
    trim: true,
  },
  instruction: {
    type: String, // যেমন: "খাবারের পরে"
    trim: true,
  },
  price: { 
    type: String, // মেডিসিনের দাম
    trim: true, 
  },
  duration: {
    value: { type: String, default: "" },
    unit: { type: String, default: "day" },
  },
  notes: {
    type: String, // প্রতিটি মেডিসিনের জন্য আলাদা নোট
    trim: true,
  },
});

const PrescriptionSchema = new mongoose.Schema({
  // কোন রোগীর প্রোফাইলের সাথে যুক্ত (আগের মতোই)
  patientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientProfile',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // ডক্টরের নাম ও ছবির স্ন্যাপশট
  doctorInfo: {
    name: { type: String, required: true },
    image: { type: String },
  },
  // একাধিক মেডিসিনের জন্য অ্যারে
  medications: [MedicationSchema],
  
  // প্রেসক্রিপশনের জন্য সাধারণ নোট (ঐচ্ছিক)
  generalNotes: {
    type: String,
    trim: true,
  },
  followUp: {
    value: { type: String, default: "" },
    unit: { type: String, default: "day" },
  },
  // ডাক্তারের পরামর্শ দেওয়া রিপোর্ট
  suggestedReports: {
    type: [String],
    default: [],
  },
  
}, {
  timestamps: true, // কখন প্রেসক্রিপশনটি তৈরি হয়েছে তা জানার জন্য
});

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);