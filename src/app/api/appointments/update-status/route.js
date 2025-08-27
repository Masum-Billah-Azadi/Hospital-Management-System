// src/app/api/appointments/update-status/route.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";

export async function PATCH(request) {
    // 1. Get session and protect the route
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { appointmentId, status, scheduledTime } = await request.json();

        // 2. Validate input
        if (!appointmentId || !status) {
            return NextResponse.json({ message: "Missing appointment ID or status" }, { status: 400 });
        }

        // 3. Find the appointment and verify it belongs to the logged-in doctor
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        if (appointment.doctor.toString() !== session.user.id) {
            return NextResponse.json({ message: "Forbidden: You do not own this appointment" }, { status: 403 });
        }
        
        // 4. Update the appointment status and time
        appointment.status = status;
        if (status === 'accepted' && scheduledTime) {
            appointment.scheduledTime = scheduledTime;
        }

        await appointment.save();

        return NextResponse.json(
            { message: "Appointment updated successfully", appointment },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json(
            { message: "An error occurred while updating the appointment." },
            { status: 500 }
        );
    }
}