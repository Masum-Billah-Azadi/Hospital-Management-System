// src/app/api/appointments/doctor/route.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import User from "@/models/User.model"; // Make sure User model is imported

export async function GET(request) {
    // 1. Get the session and protect the route
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json(
            { message: "Unauthorized. You must be a doctor to access this." },
            { status: 401 }
        );
    }

    try {
        await dbConnect();

        // 2. Fetch appointments for the logged-in doctor
        const appointments = await Appointment.find({ doctor: session.user.id })
            .populate({
                path: 'patient',
                model: User,
                select: 'name email' // Select which fields of the patient to return
            })
            .sort({ createdAt: -1 }); // Show newest appointments first

        return NextResponse.json(appointments, { status: 200 });

    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching appointments." },
            { status: 500 }
        );
    }
}