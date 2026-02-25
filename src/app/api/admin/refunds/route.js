import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import PatientProfile from "@/models/PatientProfile.model"; // ✅ পেশেন্ট প্রোফাইল ইমপোর্ট করা হলো
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    // ১. প্রথমে অ্যাপয়েন্টমেন্ট এবং ইউজারের ডাটা আনা হচ্ছে (lean() ব্যবহার করা হয়েছে যাতে ডাটা মডিফাই করা যায়)
    const rejectedAppointments = await Appointment.find({ status: "rejected" })
      .populate({ path: "patient", select: "name email image" })
      .populate({ path: "doctor", select: "name" })
      .sort({ updatedAt: -1 })
      .lean();

    // ২. প্রতিটি পেশেন্টের প্রোফাইল থেকে ফোন নাম্বার খুঁজে বের করা হচ্ছে
    const appointmentsWithPhone = await Promise.all(
      rejectedAppointments.map(async (app) => {
        if (app.patient && app.patient._id) {
          const profile = await PatientProfile.findOne({
            user: app.patient._id,
          }).select("phone");

          // যদি প্রোফাইলে ফোন নাম্বার থাকে, তবে সেটি patient অবজেক্টের ভেতরে ঢুকিয়ে দেওয়া হচ্ছে
          if (profile && profile.phone) {
            app.patient.phone = profile.phone;
          }
        }
        return app;
      }),
    );

    return NextResponse.json(appointmentsWithPhone, { status: 200 });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const { appointmentId } = await request.json();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { isRefunded: true },
      { new: true },
    );

    return NextResponse.json(
      {
        message: "Refund marked successfully",
        appointment: updatedAppointment,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating refund status:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
