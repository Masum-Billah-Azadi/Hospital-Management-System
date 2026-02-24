// src/models/DoctorProfile.model.js
import mongoose from "mongoose";

const DoctorProfileSchema = new mongoose.Schema(
  {
    // ডাক্তারের নিজের User ID
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
      default: "General Physician",
    },
    address: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableSlots: {
      type: [String], // এটি একটি অ্যারে হবে
      default: ["10:00 AM", "11:00 AM", "05:00 PM", "06:00 PM"], // কিছু ডিফল্ট স্লট দিয়ে রাখলাম
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.DoctorProfile ||
  mongoose.model("DoctorProfile", DoctorProfileSchema);
