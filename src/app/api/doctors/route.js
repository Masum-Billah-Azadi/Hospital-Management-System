// src/app/api/doctor/route.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {                           
        await dbConnect();

        // Find all users with the role 'doctor' and select only the fields we need
        const doctors = await User.find({ role: 'doctor' }).select('_id name email image');

        return NextResponse.json(doctors, { status: 200 });

    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching the list of doctors." },
            { status: 500 }
        );
    }
}