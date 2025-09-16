import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import Prescription from "@/models/Prescription.model";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

// GET ফাংশন (অপরিবর্তিত)
export async function GET(request, { params }) {
    const { patientId: userId } = params;
    try {
        await dbConnect();
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

// PATCH ফাংশন (পরিবর্তিত)
export async function PATCH(request, { params }) {
    const { patientId: userId } = params;
    const data = await request.json();
    try {
        await dbConnect();
        const patientProfile = await PatientProfile.findOne({ user: userId });
        if (!patientProfile) {
            return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
        }

        // Vitals এবং রিপোর্ট আপডেট
        if (data.age !== undefined) patientProfile.age = data.age;
        if (data.height !== undefined) patientProfile.height = data.height;
        if (data.weight !== undefined) patientProfile.weight = data.weight;
        if (data.bloodPressure !== undefined) patientProfile.bloodPressure = data.bloodPressure;
        if (data.report) patientProfile.reports.push(data.report);
        
        await patientProfile.save();
        
        // **পরিবর্তন:** GET ফাংশনের মতো একই ফরম্যাটে রেসপন্স পাঠানো হচ্ছে
        const updatedPopulatedProfile = await PatientProfile.findOne({ user: userId }).populate('user');
        const prescriptions = await Prescription.find({ patientProfile: updatedPopulatedProfile._id }).sort({ createdAt: -1 });
        
        const responseData = {
            ...updatedPopulatedProfile.toObject(),
            prescriptions: prescriptions
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Error updating profile by doctor:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}