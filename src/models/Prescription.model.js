// src/models/Prescription.model.js
import mongoose from 'mongoose';

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
    medicationName: {
        type: String,
        trim: true,
    },
    dosage: {
        type: String, // যেমন: "500mg - 1+0+1"
        trim: true,
    },
    notes: {
        type: String, // অতিরিক্ত কোনো পরামর্শ
        trim: true,
    },
}, {
    timestamps: true, // কখন প্রেসক্রিপশনটি তৈরি হয়েছে তা জানার জন্য
});

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);