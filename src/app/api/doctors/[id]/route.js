// src/app/api/doctors/[id]/route.js
import dbConnect from "@/lib/dbConnect";
import DoctorProfile from "@/models/DoctorProfile.model";
import User from "@/models/User.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid Doctor ID format" },
      { status: 400 },
    );
  }

  try {
    const doctorProfile = await DoctorProfile.findOne({ user: id }).populate({
      path: "user",
      model: User,
      select: "name email image",
    });

    if (doctorProfile) {
      // Mongoose Document কে রেগুলার Object এ রূপান্তর করা হচ্ছে
      const profileObj = doctorProfile.toObject();

      // ✅ পুরনো ডক্টরদের ডাটাবেসে স্লট না থাকলে ডিফল্ট স্লট সেট করে দেওয়া হচ্ছে
      profileObj.availableSlots =
        profileObj.availableSlots && profileObj.availableSlots.length > 0
          ? profileObj.availableSlots
          : ["10:00 AM", "11:00 AM", "05:00 PM", "06:00 PM"];

      // ✅ পুরনো ডক্টরদের Availability স্ট্যাটাস না থাকলে ডিফল্ট True করে দেওয়া হচ্ছে
      profileObj.isAvailable =
        profileObj.isAvailable !== undefined ? profileObj.isAvailable : true;

      return NextResponse.json(profileObj, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching doctor details." },
      { status: 500 },
    );
  }
}
