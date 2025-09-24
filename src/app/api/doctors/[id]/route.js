// src/app/api/doctors/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import DoctorProfile from "@/models/DoctorProfile.model"; // DoctorProfile মডেল ইম্পোর্ট করুন
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    await dbConnect();
    const { id } = params; // এটি ডাক্তারের User ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid Doctor ID format" }, { status: 400 });
    }

    try {
        // DoctorProfile মডেল থেকে user ID দিয়ে ডাক্তারকে খোঁজা হচ্ছে
        const doctorProfile = await DoctorProfile.findOne({ user: id })
            .populate({
                path: 'user', // DoctorProfile-এর 'user' ফিল্ডটিকে populate করা হচ্ছে
                model: User,
                select: 'name email image' // User মডেল থেকে এই তথ্যগুলো আনা হচ্ছে
            });

        if (doctorProfile) {
            // এখন doctorProfile অবজেক্টের ভেতরে designation এবং user-এর সব তথ্য আছে
            return NextResponse.json(doctorProfile, { status: 200 });
        } else {
            return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
        }

    } catch (error) {
        console.error("Error fetching doctor:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching doctor details." },
            { status: 500 }
        );
    }
}