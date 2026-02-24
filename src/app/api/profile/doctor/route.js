// src/app/api/profile/doctor/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import DoctorProfile from "@/models/DoctorProfile.model";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// লগইন করা ডাক্তারের প্রোফাইল তথ্য পাওয়ার জন্য
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    // প্রথমে DoctorProfile খোঁজা হচ্ছে
    const profile = await DoctorProfile.findOne({ user: session.user.id });

    // User মডেল থেকে বেসিক তথ্য সবসময়ই নেওয়া হচ্ছে
    const user = await User.findById(session.user.id).select(
      "name email image",
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // দুটি তথ্য একসাথে করে পাঠানো হচ্ছে
    const fullProfile = {
      name: user.name,
      email: user.email,
      image: user.image,
      phone: profile ? profile.phone : "",
      designation: profile ? profile.designation : "",
      address: profile ? profile.address : "",
      bio: profile ? profile.bio : "",
      isAvailable:
        profile && profile.isAvailable !== undefined
          ? profile.isAvailable
          : true,
      availableSlots:
        profile && profile.availableSlots
          ? profile.availableSlots
          : ["10:00 AM", "11:00 AM", "05:00 PM", "06:00 PM"],
    };

    return NextResponse.json(fullProfile, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ডাক্তারের প্রোফাইল তৈরি বা আপডেট করার জন্য
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();

    // ✅ ফ্রন্টএন্ড থেকে bio রিসিভ করা হচ্ছে
    const {
      name,
      image,
      phone,
      designation,
      address,
      bio,
      isAvailable,
      availableSlots,
    } = data;

    // ১. User মডেলের তথ্য (নাম, ছবি) আপডেট করা
    await User.findByIdAndUpdate(session.user.id, { name, image });

    // ২. DoctorProfile মডেলের তথ্য (ফোন, পদ, ঠিকানা, বায়োডাটা) আপডেট বা তৈরি করা
    // ✅ ডাটাবেসে সেভ করার জন্য profileData তে bio যোগ করা হলো
    const profileData = {
      phone,
      designation,
      address,
      bio,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      availableSlots: availableSlots || [
        "10:00 AM",
        "11:00 AM",
        "05:00 PM",
        "06:00 PM",
      ], // যদি ফাঁকা আসে তবে ডিফল্ট বসবে
      user: session.user.id,
    };

    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { user: session.user.id },
      profileData,
      { new: true, upsert: true }, // upsert: true মানে হলো, প্রোফাইল না থাকলে নতুন তৈরি করবে
    );

    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
