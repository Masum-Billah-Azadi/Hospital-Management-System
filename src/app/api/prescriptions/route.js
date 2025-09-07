// src/app/api/prescriptions/route.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Prescription from '@/models/Prescription.model';
import PatientProfile from '@/models/PatientProfile.model';
import User from '@/models/User.model';

// এই POST ফাংশনটি আপনার ফাইলে থাকা আবশ্যক
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'doctor') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const { patientProfileId, medications, generalNotes, suggestedReports } = await request.json();
    const doctorId = session.user.id;

    // ভ্যালিডেশন
    if (!patientProfileId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json({ message: 'Patient ID and at least one medication are required.' }, { status: 400 });
    }

    // নিরাপত্তা চেক
    const patientProfile = await PatientProfile.findById(patientProfileId);
    if (!patientProfile || !patientProfile.doctors.some(id => id.equals(doctorId))) {
      return NextResponse.json({ message: "Forbidden: You are not authorized for this patient." }, { status: 403 });
    }
    
    // ডক্টরের তথ্য (স্ন্যাপশট)
    const doctorInfo = await User.findById(doctorId).select('name image').lean();
    if (!doctorInfo) {
        return NextResponse.json({ message: "Doctor not found." }, { status: 404 });
    }

    const newPrescription = new Prescription({
      patientProfile: patientProfileId,
      doctor: doctorId,
      doctorInfo: {
        name: doctorInfo.name,
        image: doctorInfo.image,
      },
      medications,
      generalNotes,
      suggestedReports: suggestedReports || [],
      reports: [], // আপলোড করা রিপোর্টের জন্য খালি অ্যারে
    });

    await newPrescription.save();
    return NextResponse.json({ message: 'Prescription added successfully!', prescription: newPrescription }, { status: 201 });

  } catch (error) {
    console.error("Error adding prescription:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// আপনি যদি এই রুটে GET রিকোয়েস্ট হ্যান্ডেল করতে চান, তাহলে GET ফাংশনও রাখতে পারেন।
// আপাতত POST ফাংশনটিই মূল ফোকাস।