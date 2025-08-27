// src/models/DoctorProfile.model.js
import mongoose from 'mongoose';

const DoctorProfileSchema = new mongoose.Schema({
    // ডাক্তারের নিজের User ID
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // ডাক্তারের ব্যক্তিগত তথ্য
    phone: {
        type: String,
        trim: true,
    },
    designation: {
        type: String,
        trim: true,
        default: 'General Physician',
    },
    address: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

export default mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', DoctorProfileSchema);