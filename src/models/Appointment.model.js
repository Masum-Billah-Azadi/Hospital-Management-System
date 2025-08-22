// src/models/Appointment.model.js
import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Please provide a date for the appointment'],
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for your visit'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    scheduledTime: { // Doctor will set this time after accepting
        type: String, 
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);