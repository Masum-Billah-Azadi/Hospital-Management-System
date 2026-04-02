import mongoose from "mongoose";

const HomeoPrescriptionSchema = new mongoose.Schema(
  {
    patientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedSymptoms: [
      {
        type: String,
      },
    ],
    repertoryResult: {
      type: String,
    },
    // ✅ নতুন ফিল্ড: ডক্টরের দেওয়া চূড়ান্ত ঔষধের তালিকা
    medicines: [
      {
        medicineName: { type: String }, // ঔষধের নাম বা নাম্বার
        power: { type: String }, // ঔষধের শক্তি (যেমন: 30, 200, 1M)
        instruction: { type: String }, // খাওয়ার নিয়ম
      },
    ],
    generalNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.HomeoPrescription ||
  mongoose.model("HomeoPrescription", HomeoPrescriptionSchema);
