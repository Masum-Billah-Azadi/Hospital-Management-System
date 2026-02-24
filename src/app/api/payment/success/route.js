import Appointment from "@/models/Appointment.model";
import Payment from "@/models/Payment.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tran_id = searchParams.get("tran_id");

    await mongoose.connect(process.env.MONGODB_URI);

    const payment = await Payment.findOne({ transactionId: tran_id });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }

    if (payment.status !== "VALID") {
      payment.status = "VALID";
      await payment.save();

      // এখানে আমরা Appointment তৈরি করছি
      // আপনার পুরোনো কোডের মতোই patient, doctor, date, reason বসাচ্ছি
      const newAppointment = await Appointment.create({
        patient: payment.patientId, // Init রাউটে সেশন থেকে পাওয়া আইডি
        doctor: payment.doctorId,
        appointmentDate: payment.appointmentDate,
        timeSlot: payment.timeSlot,
        reason: payment.reason,
        status: "pending", // ডিফল্ট স্ট্যাটাস
        paymentStatus: "paid", // পেমেন্ট হয়েছে তাই মার্ক করে রাখলাম
        transactionId: tran_id,
      });

      console.log("✅ Appointment Booked:", newAppointment._id);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/success?tran_id=${tran_id}`,
      {
        status: 303,
      },
    );
  } catch (error) {
    console.error("Payment Success Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
