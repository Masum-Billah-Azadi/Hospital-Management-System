// src/app/api/patients/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PatientProfile from '@/models/PatientProfile.model';
import User from '@/models/User.model'; // User মডেল ইম্পোর্ট করা জরুরি

// --- নতুন GET ফাংশন ---
// লগইন করা ডাক্তারের সব রোগীর তালিকা আনার জন্য
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const doctorId = session.user.id;

        // সেই সব রোগীর প্রোফাইল খোঁজা হচ্ছে যাদের doctors অ্যারেতে বর্তমান ডাক্তারের আইডি আছে
        const patients = await PatientProfile.find({ doctors: doctorId })
            .populate({
                path: 'user', // user ফিল্ডের আইডি দিয়ে User কালেকশন থেকে তথ্য আনা হচ্ছে
                select: 'name email image' // শুধুমাত্র এই ফিল্ডগুলো আনা হচ্ছে
            });

        return NextResponse.json(patients, { status: 200 });

    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// --- পুরনো POST ফাংশন (অপরিবর্তিত) ---
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { patientId } = await request.json();
        const doctorId = session.user.id;

        if (!patientId) {
            return NextResponse.json({ message: 'Patient ID is required.' }, { status: 400 });
        }

        const updatedPatientProfile = await PatientProfile.findOneAndUpdate(
            { user: patientId },
            { $addToSet: { doctors: doctorId } },
            { new: true, upsert: true }
        );

        return NextResponse.json(
            { message: 'Patient added successfully!', profile: updatedPatientProfile },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error adding patient:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}