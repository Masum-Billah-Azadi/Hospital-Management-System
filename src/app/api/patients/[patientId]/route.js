// src/app/api/patients/[patientId]/route.js
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import Prescription from "@/models/Prescription.model";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

// GET ফাংশন (ডাক্তার রোগীর তথ্য দেখার জন্য)
export async function GET(request, { params }) {
    // URL থেকে যে ID আসছে, সেটি রোগীর User ID
    const { patientId: userId } = params;

    try {
        await dbConnect();
        
        // user ID দিয়ে সঠিক PatientProfile খোঁজা হচ্ছে
        const patientProfile = await PatientProfile.findOne({ user: userId }).populate('user');

        if (!patientProfile) {
            return NextResponse.json({ message: "Patient profile not found." }, { status: 404 });
        }
        
        const prescriptions = await Prescription.find({ patientProfile: patientProfile._id }).sort({ createdAt: -1 });

        const responseData = {
            ...patientProfile.toObject(),
            prescriptions: prescriptions
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Error fetching patient profile by doctor:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// **নতুন:** PATCH ফাংশন (ডাক্তার রোগীর Vitals আপডেট করার জন্য)
export async function PATCH(request, { params }) {
    // URL থেকে যে ID আসছে, সেটি রোগীর User ID
    const { patientId: userId } = params;
    const data = await request.json();

    try {
        await dbConnect();

        // user ID দিয়ে সঠিক PatientProfile খোঁজা হচ্ছে
        const patientProfile = await PatientProfile.findOne({ user: userId });

        if (!patientProfile) {
            return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
        }

        // শুধুমাত্র Vitals তথ্য আপডেট করা হচ্ছে
        patientProfile.age = data.age;
        patientProfile.height = data.height;
        patientProfile.weight = data.weight;
        patientProfile.bloodPressure = data.bloodPressure;

        await patientProfile.save();
        
        const populatedProfile = await patientProfile.populate('user');
        
        return NextResponse.json({ success: true, profile: populatedProfile });

    } catch (error) {
        console.error("Error updating vitals by doctor:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}