// src/app/api/register/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json(); // role এখন frontend থেকে আসবে

    if (!name || !email || !password) {
        return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    await dbConnect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'patient', // ডিফল্ট হিসেবে patient সেট করা হলো
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}