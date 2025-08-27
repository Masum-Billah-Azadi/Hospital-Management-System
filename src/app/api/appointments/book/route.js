// src/app/api/appointments/book/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";

export async function POST(request) {
    // ১. সেশন চেক করে নিশ্চিত হওয়া যে একজন রোগী লগইন করা আছে
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
        return NextResponse.json({ message: "Unauthorized. Please log in as a patient." }, { status: 401 });
    }

    try {
        await dbConnect();
        const { doctorId, appointmentDate, reason } = await request.json();

        // ২. ইনপুট ভ্যালিডেশন
        if (!doctorId || !appointmentDate || !reason) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }

        // ৩. নতুন অ্যাপয়েন্টমেন্ট তৈরি করা
        const newAppointment = new Appointment({
            patient: session.user.id, // লগইন করা রোগীর আইডি
            doctor: doctorId,
            appointmentDate,
            reason,
            status: 'pending' // ডিফল্ট স্ট্যাটাস
        });

        await newAppointment.save();

        return NextResponse.json(
            { message: "Appointment booked successfully!", appointment: newAppointment },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error booking appointment:", error);
        return NextResponse.json(
            { message: "An error occurred while booking the appointment." },
            { status: 500 }
        );
    }
}