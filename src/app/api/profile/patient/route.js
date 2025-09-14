//src\app\api\profile\patient\route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import Prescription from "@/models/Prescription.model";
import User from "@/models/User.model";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// রোগীর ড্যাশবোর্ডের জন্য সব ডেটা আনার ফাংশন
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const userId = session.user.id;

        const patientProfile = await PatientProfile.findOne({ user: userId }).populate('user');
        
        if (!patientProfile) {
            return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
        }

        const prescriptions = await Prescription.find({ patientProfile: patientProfile._id })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            profile: patientProfile,
            prescriptions: prescriptions
        });
    } catch (error) {
        console.error("Error fetching patient dashboard data:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// রোগীর প্রোফাইল আপডেট করার ফাংশন
export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const data = await request.json();
        const userId = session.user.id;

        await User.findByIdAndUpdate(userId, {
            name: data.name,
            image: data.image,
        });

        const patientProfile = await PatientProfile.findOne({ user: userId });
        if (!patientProfile) {
            return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
        }
        
        // Vitals, DOB এবং Report আপডেট করা
        patientProfile.age = data.age;
        patientProfile.height = data.height;
        patientProfile.weight = data.weight;
        patientProfile.bloodPressure = data.bloodPressure;
        
        if (data.report) {
            patientProfile.reports.push(data.report);
        }
        
        await patientProfile.save();

        return NextResponse.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating patient profile:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}