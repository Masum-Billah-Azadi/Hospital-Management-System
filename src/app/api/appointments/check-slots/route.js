import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    // ফ্রন্টএন্ড থেকে ডক্টরের আইডি এবং নির্বাচিত তারিখ রিসিভ করা হচ্ছে
    const { doctorId, date } = await request.json();

    if (!doctorId || !date) {
      return NextResponse.json(
        { message: "Doctor ID and date are required" },
        { status: 400 },
      );
    }

    // ডাটাবেস থেকে ওই ডক্টরের এবং ওই তারিখের সব অ্যাপয়েন্টমেন্ট খুঁজে বের করা হচ্ছে
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: date,
    });

    // শুধু বুক হয়ে যাওয়া টাইম স্লটগুলোর একটি লিস্ট তৈরি করা হচ্ছে
    const bookedSlots = existingAppointments.map((app) => app.timeSlot);

    // ফ্রন্টএন্ডে সেই লিস্ট পাঠানো হচ্ছে
    return NextResponse.json({ bookedSlots }, { status: 200 });
  } catch (error) {
    console.error("Error checking booked slots:", error);
    return NextResponse.json(
      { message: "Server error while checking slots" },
      { status: 500 },
    );
  }
}
