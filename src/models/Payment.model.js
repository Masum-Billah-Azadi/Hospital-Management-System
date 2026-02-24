import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  customerName: { type: String, required: false },
  customerEmail: { type: String, required: false },
  mobile: { type: String, required: false },

  patientId: { type: String, required: true }, // এটি User ID (ObjectId)
  doctorId: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  reason: { type: String, required: true },

  status: {
    type: String,
    enum: ["PENDING", "VALID", "FAILED", "CANCELLED"],
    default: "PENDING",
  },
  val_id: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
