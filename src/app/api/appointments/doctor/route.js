// src/app/api/appointments/doctor/route.js

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import User from "@/models/User.model"; // User model is needed for populating
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json(
            { message: "Unauthorized. You must be a doctor to access this." },
            { status: 401 }
        );
    }

    try {
        await dbConnect();

        // **পরিবর্তন:** এখানে populate সঠিকভাবে User মডেল থেকে image সহ সব তথ্য আনবে
        const appointments = await Appointment.find({ doctor: session.user.id })
            .populate({
                path: 'patient', // Appointment মডেলের 'patient' ফিল্ড, যা User ID ধারণ করে
                model: User,
                select: 'name email image' // User মডেল থেকে নাম, ইমেল এবং ছবি আনা হচ্ছে
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(appointments, { status: 200 });

    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching appointments." },
            { status: 500 }
        );
    }
}