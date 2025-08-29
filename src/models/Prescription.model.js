// src/models/Prescription.model.js
import mongoose from 'mongoose';

// প্রতিটি ওষুধের জন্য একটি সাব-স্কিমা
const MedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    dosage: {
        type: String, // যেমন: "1+0+1 After Meal"
        trim: true,
    },
});

const PrescriptionSchema = new mongoose.Schema({
    // কোন রোগীর প্রোফাইলের সাথে যুক্ত
    patientProfile: {
        type: mongoose.Schema.ObjectId,
        ref: 'PatientProfile',
        required: true,
    },
    // কোন ডাক্তার প্রেসক্রিপশনটি দিয়েছেন
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    // ওষুধের তালিকা এখন একটি অ্যারে হবে
    medicines: [MedicineSchema],
    // সম্পূর্ণ প্রেসক্রিপশনের জন্য সাধারণ নোট
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true, // প্রেসক্রিপশন তৈরির তারিখ জানার জন্য
});

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);