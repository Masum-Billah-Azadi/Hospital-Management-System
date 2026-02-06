// src/app/api/profile/admin/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // এডমিনের তথ্য ইউজার টেবিল থেকেই আসবে
    const admin = await User.findById(session.user.id).select("-password");

    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, mobile, image } = await req.json();

    // এডমিনের তথ্য আপডেট করা হচ্ছে
    const updatedAdmin = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        mobile,
        image,
      },
      { new: true, runValidators: true },
    ).select("-password");

    return NextResponse.json(
      { message: "Profile updated successfully", admin: updatedAdmin },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
