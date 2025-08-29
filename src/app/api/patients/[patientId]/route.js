// src/app/api/patients/[patientId]/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PatientProfile from '@/models/PatientProfile.model';
import User from '@/models/User.model';
import Prescription from '@/models/Prescription.model'; // Prescription মডেল ইম্পোর্ট করুন
import mongoose from 'mongoose';


export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return NextResponse.json({ message: "Invalid Patient ID" }, { status: 400 });
    }

    try {
        await dbConnect();
        
        // ধাপ ১: রোগীর প্রোফাইল এবং বেসিক তথ্য আনা
        const patientProfile = await PatientProfile.findOne({ user: patientId })
            .populate({
                path: 'user',
                model: User,
                select: 'name email image'
            });

        if (!patientProfile) {
            return NextResponse.json({ message: "Patient profile not found." }, { status: 404 });
        }

        // ধাপ ২: নিরাপত্তা চেক (ডাক্তার অনুমোদিত কি না)
        const isAuthorized = patientProfile.doctors.some(id => id.equals(session.user.id));
        if (!isAuthorized) {
            return NextResponse.json({ message: "Forbidden. You are not authorized to view this patient's profile." }, { status: 403 });
        }
        
        // ধাপ ৩: রোগীর সব প্রেসক্রিপশন খুঁজে বের করা
        const prescriptions = await Prescription.find({ patientProfile: patientProfile._id })
            .populate('doctor', 'name') // প্রেসক্রিপশনটি কোন ডাক্তার দিয়েছেন তার নাম আনার জন্য
            .sort({ createdAt: -1 }); // নতুন প্রেসক্রিপশনগুলো আগে দেখানোর জন্য

        // ধাপ ৪: সব তথ্য একত্রিত করে পাঠানো
        const responseData = {
            ...patientProfile.toObject(),
            prescriptions: prescriptions,
        };
        
        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
// --- নতুন PATCH ফাংশন ---
// রোগীর Vitals আপডেট করার জন্য
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return NextResponse.json({ message: "Invalid Patient ID" }, { status: 400 });
    }

    try {
        await dbConnect();
        
        // নিরাপত্তা চেক: এই ডাক্তার কি রোগীর তালিকাভুক্ত ডাক্তার?
        const patientProfile = await PatientProfile.findOne({ user: patientId });
        if (!patientProfile || !patientProfile.doctors.some(id => id.equals(session.user.id))) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        
        // রিকোয়েস্ট বডি থেকে নতুন ডেটা নেওয়া
        const updatedVitals = await request.json();
        
        // Vitals ডেটা আপডেট করা
        const updatedProfile = await PatientProfile.findByIdAndUpdate(
            patientProfile._id,
            { $set: updatedVitals },
            { new: true } // আপডেট করা ডকুমেন্টটি রিটার্ন করার জন্য
        );

        return NextResponse.json({ message: 'Vitals updated successfully', profile: updatedProfile }, { status: 200 });

    } catch (error) {
        console.error("Error updating vitals:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}