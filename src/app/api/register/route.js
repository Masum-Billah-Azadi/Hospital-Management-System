// src/app/api/register/route.js
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model"; // **১. PatientProfile মডেল ইম্পোর্ট করুন**
import User from "@/models/User.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    await dbConnect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }

    // **পরিবর্তন:** এখান থেকে হ্যাশিং কোড সরিয়ে ফেলা হয়েছে
    const newUser = await User.create({
      name,
      email,
      password: password, // <-- প্লেইন পাসওয়ার্ড পাঠানো হচ্ছে
      role: role || 'patient',
    });
    
    if (newUser.role === 'patient') {
      await PatientProfile.create({ user: newUser._id });
    }

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}