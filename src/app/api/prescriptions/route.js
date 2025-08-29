// src/app/api/prescriptions/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Prescription from '@/models/Prescription.model';
import PatientProfile from '@/models/PatientProfile.model';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        // এখন আমরা medicines (অ্যারে) এবং notes গ্রহণ করব
        const { patientProfileId, medicines, notes } = await request.json();
        const doctorId = session.user.id;

        if (!patientProfileId || !medicines || medicines.length === 0) {
            return NextResponse.json({ message: 'Patient and at least one medicine are required.' }, { status: 400 });
        }
        
        // নিরাপত্তা চেক (অপরিবর্তিত)
        const patientProfile = await PatientProfile.findById(patientProfileId);
        if (!patientProfile || !patientProfile.doctors.some(id => id.equals(doctorId))) {
             return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const newPrescription = new Prescription({
            patientProfile: patientProfileId,
            doctor: doctorId,
            medicines, // সম্পূর্ণ ওষুধের অ্যারে
            notes,
        });

        await newPrescription.save();
        
        return NextResponse.json({ message: 'Prescription created successfully!', prescription: newPrescription }, { status: 201 });

    } catch (error) {
        console.error("Error creating prescription:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}