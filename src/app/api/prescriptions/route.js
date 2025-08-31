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
        const { patientProfileId, medicationName, dosage, notes } = await request.json();
        const doctorId = session.user.id;


        if (!patientProfileId || !medicationName) {
            return NextResponse.json({ message: 'Patient and medication name are required.' }, { status: 400 });
        }
        
        // নিরাপত্তা চেক: ডাক্তার কি এই রোগীর জন্য অনুমোদিত?
        const patientProfile = await PatientProfile.findById(patientProfileId);
        if (!patientProfile || !patientProfile.doctors.some(id => id.equals(doctorId))) {
             return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const newPrescription = new Prescription({
            patientProfile: patientProfileId,
            doctor: doctorId,
            medicationName,
            dosage,
            notes,
        });

        await newPrescription.save();
        
        return NextResponse.json({ message: 'Prescription added successfully!', prescription: newPrescription }, { status: 201 });

    } catch (error) {
        console.error("Error adding prescription:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}