// src/models/PrescriptionFile.js
import mongoose from "mongoose";
import connectPrescDB from "@/lib/mongodbPresc";

const PrescriptionFileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    patient_name: String,
    doctor_name: String,
    created_at: { type: Date, default: Date.now },
    pdf_data: { type: String, required: true }, // base64 (যেটা স্ক্রিনশটে আছে)
    fileName: { type: String, default: "Prescription.pdf" },
    mimeType: { type: String, default: "application/pdf" },
    source: { type: String, enum: ["auto", "manual"], default: "auto" },
  },
  {
    // 🔴 এই লাইনের জন্যই Atlas–এর `Hospital.prescriptions` collection use হবে
    collection: "prescriptions",
  }
);

export default async function getPrescriptionFileModel() {
  const conn = await connectPrescDB();
  return (
    conn.models.PrescriptionFile ||
    conn.model("PrescriptionFile", PrescriptionFileSchema)
  );
}
