// src/models/PatientProfile.model.js
import mongoose from "mongoose";

const PatientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    age: { type: String },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    height: { type: String },
    weight: { type: String },
    bloodPressure: { type: String },
    diagnosis: { type: String },

    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String, // "A+", "O-", etc.
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    reports: [
      {
        fileName: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: "patientprofiles",
  },
);

export default mongoose.models.PatientProfile ||
  mongoose.model("PatientProfile", PatientProfileSchema);
