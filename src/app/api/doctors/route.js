// src/app/api/doctor/route.js
import dbConnect from "@/lib/dbConnect";
import DoctorProfile from "@/models/DoctorProfile.model";
import User from "@/models/User.model"; // populate করার জন্য User মডেল import করা আবশ্যক
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await dbConnect();
        
        // DoctorProfile থেকে সব ডাক্তারকে খোঁজা হচ্ছে এবং তাদের User তথ্য populate করা হচ্ছে
        const doctors = await DoctorProfile.find({}).populate({
            path: 'user',
            model: User, // কোন মডেল থেকে populate হবে
            select: '-password' // পাসওয়ার্ড ছাড়া সব তথ্য
        });

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors list:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}