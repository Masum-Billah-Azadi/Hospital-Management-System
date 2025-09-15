// src/app/api/patients/[patientId]/route.js
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import Prescription from    "@/models/Prescription.model";
import { NextResponse } from "next/server";
// User এবং Prescription মডেল এখানে প্রয়োজন হতে পারে GET এর জন্য

// GET ফাংশন (ডাক্তার রোগীর তথ্য দেখার জন্য)
export async function GET(request, { params }) {
    const { patientId: userId } = params;

    try {
        await dbConnect();
        
        const patientProfile = await PatientProfile.findOne({ user: userId })
            .populate('user');

        if (!patientProfile) {
            return NextResponse.json({ message: "Patient profile not found." }, { status: 404 });
        }
        
        // **নতুন:** প্রেসক্রিপশনগুলো আলাদাভাবে খোঁজা হচ্ছে
        const prescriptions = await Prescription.find({ patientProfile: patientProfile._id })
            .sort({ createdAt: -1 });

        // **নতুন:** দুটি ফলাফল একসাথে করে পাঠানো হচ্ছে
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
// PATCH ফাংশন (ডাক্তার রোগীর Vitals আপডেট করার জন্য)
export async function PATCH(request, { params }) {
    const { patientId } = params;
    const data = await request.json();

    try {
        await dbConnect();

        // শুধুমাত্র Vitals তথ্য আপডেট করা হচ্ছে
        const updatedProfile = await PatientProfile.findByIdAndUpdate(
            patientId,
            {
                age: data.age,
                height: data.height,
                weight: data.weight,
                bloodPressure: data.bloodPressure,
            },
            { new: true }
        );

        if (!updatedProfile) {
            return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
        }
        
        const populatedProfile = await updatedProfile.populate('user prescriptions');
        return NextResponse.json({ success: true, profile: populatedProfile });

    } catch (error) {
        console.error("Error updating vitals by doctor:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}