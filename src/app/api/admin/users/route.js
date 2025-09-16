// src/app/api/admin/users/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    // শুধুমাত্র অ্যাডমিন এই রুটে অ্যাক্সেস পাবে
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        await dbConnect();
        const users = await User.find({}).select('-password'); // পাসওয়ার্ড ছাড়া সব তথ্য আনা
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}