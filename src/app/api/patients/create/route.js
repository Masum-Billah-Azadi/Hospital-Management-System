import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { name, phone, address } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { message: "Name and phone are required." },
        { status: 400 },
      );
    }

    const dummyEmail = `patient_${Date.now()}@homeo.com`;
    const hashedPassword = await bcrypt.hash("123456", 10);

    // ১. অটোমেটিক সিরিয়াল নাম্বার ক্যালকুলেশন
    // এই ডক্টরের আগে কতজন পেশেন্ট আছে তা গোনা হচ্ছে
    const existingPatientsCount = await PatientProfile.countDocuments({
      doctors: session.user.id,
    });
    const assignedSerialNumber = existingPatientsCount + 1; // নতুন পেশেন্টের সিরিয়াল

    const newUser = await User.create({
      name,
      email: dummyEmail,
      password: hashedPassword,
      role: "patient",
    });

    const newProfile = await PatientProfile.create({
      user: newUser._id,
      phone,
      address,
      serialNumber: assignedSerialNumber, // ✅ সিরিয়াল নাম্বার সেভ করা হলো
      doctors: [session.user.id],
    });

    const populatedProfile = await PatientProfile.findById(
      newProfile._id,
    ).populate({
      path: "user",
      select: "name email image",
    });

    return NextResponse.json(populatedProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating new patient by doctor:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
