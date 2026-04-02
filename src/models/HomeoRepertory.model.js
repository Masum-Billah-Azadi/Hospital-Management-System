import mongoose from "mongoose";

const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  medicines: [{ type: String }],
});

const HomeoRepertorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 }, // ✅ নতুন: কোন প্রশ্ন আগে আসবে তা নির্ধারণের জন্য
    symptoms: [SymptomSchema],
  },
  { timestamps: true },
);

export default mongoose.models.HomeoRepertory ||
  mongoose.model("HomeoRepertory", HomeoRepertorySchema);
