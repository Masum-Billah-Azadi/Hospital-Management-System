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
    type: String, // যেমন: "500mg - 1+0+1"
    trim: true,
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
  // কোন ডাক্তার প্রেসক্রিপশনটি দিয়েছেন (আগের মতোই)
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // **নতুন:** ডক্টরের নাম ও ছবির স্ন্যাপশট
  doctorInfo: {
    name: { type: String, required: true },
    image: { type: String }, // URL to doctor's profile picture
  },
  // **পরিবর্তিত:** একাধিক মেডিসিনের জন্য অ্যারে
  medications: [MedicationSchema],
  
  // প্রেসক্রিপশনের জন্য সাধারণ নোট (ঐচ্ছিক)
  generalNotes: {
    type: String,
    trim: true,
  },
   // **নতুন পরিমার্জিত ফিল্ড:** ডাক্তারের পরামর্শ দেওয়া রিপোর্ট
  suggestedReports: {
    type: [String], // একাধিক রিপোর্টের নাম রাখার জন্য স্ট্রিং এর অ্যারে
    default: [],
  },
  
  // **নতুন:** রিপোর্ট ফাইলের লিঙ্ক
  reports: [{
    fileName: { type: String, required: true },
    url: { type: String, required: true }, // S3 or local storage URL
  }],
  
}, {
  timestamps: true, // কখন প্রেসক্রিপশনটি তৈরি হয়েছে তা জানার জন্য
});

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);