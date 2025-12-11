// src/models/MedicalReportFile.js
import mongoose from "mongoose";
import connectPrescDB from "@/lib/mongodbPresc";

// Hospital -> medical_reports collection
const MedicalReportFileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    patient_name: { type: String, required: true },
    doctor_name: { type: String, default: "" },
    disease: { type: String, default: "" },

    created_at: { type: Date, default: Date.now },

    // main PDF/image data (base64, exactly like existing docs)
    pdf_data: { type: String, required: true },

    fileName: { type: String, default: "MedicalReport.pdf" },
    mimeType: { type: String, default: "application/pdf" },

    source: { type: String, enum: ["auto", "manual"], default: "auto" },
  },
  {
    collection: "medical_reports",
  }
);

export default async function getMedicalReportModel() {
  const conn = await connectPrescDB();
  return (
    conn.models.MedicalReportFile ||
    conn.model("MedicalReportFile", MedicalReportFileSchema)
  );
}

