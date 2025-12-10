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

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'patient') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await request.json();
        const userId = session.user.id;
        const { name, image, report, ...profileData } = body;

        // User মডেলে নাম ও ছবি আপডেট করা (যদি থাকে)
        if (name || image) {
            const userUpdate = {};
            if (name) userUpdate.name = name;
            if (image) userUpdate.image = image;
            await User.findByIdAndUpdate(userId, userUpdate);
        }
        
        // PatientProfile আপডেটের জন্য পে-লোড তৈরি করা
        const updatePayload = { $set: profileData };
        if (report) {
            updatePayload.$push = { reports: report };
        }

        // findOneAndUpdate ব্যবহার করে প্রোফাইল আপডেট বা তৈরি করা
        const updatedProfile = await PatientProfile.findOneAndUpdate(
            { user: userId },
            updatePayload,
            { new: true, upsert: true, runValidators: true } // new: true আপডেট করা ডকুমেন্টটি ফেরত দেয়, upsert: true প্রোফাইল না থাকলে নতুন তৈরি করে
        );

        return NextResponse.json({ success: true, message: "Profile updated successfully!", profile: updatedProfile });

    } catch (error) {
        console.error("Error updating patient profile:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}