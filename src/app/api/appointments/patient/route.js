// src/app/api/appointments/patient/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import User from "@/models/User.model";

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'patient') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const appointments = await Appointment.find({ patient: session.user.id })
            .populate({
                path: 'doctor',
                model: User,
                select: 'name image' // ডাক্তারের শুধু নাম দরকার
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(appointments, { status: 200 });

    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        return NextResponse.json({ message: "Error fetching appointments" }, { status: 500 });
    }
}