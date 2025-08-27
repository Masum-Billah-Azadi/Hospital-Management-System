// src/app/api/doctors/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid Doctor ID format" }, { status: 400 });
    }

    try {
        const doctor = await User.findById(id);

        if (doctor && doctor.role === 'doctor') {
            return NextResponse.json({ name: doctor.name, email: doctor.email }, { status: 200 });
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