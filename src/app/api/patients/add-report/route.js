// src/app/api/patients/add-report/route.js
import dbConnect from '@/lib/dbConnect';
import '@/models/PatientProfile.model'; // মডেলটি একবার রেজিস্টার করার জন্য ইম্পোর্ট করা
import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // Mongoose সরাসরি ইম্পোর্ট করা

export async function POST(request) {
  console.log("--- FINAL ATTEMPT: Using direct model retrieval ---");
  try {
    const { patientId, fileName, url } = await request.json();

    if (!patientId || !fileName || !url) {
      return NextResponse.json({ message: 'Patient ID, File name and URL are required.' }, { status: 400 });
    }

    await dbConnect();

    // **মূল পরিবর্তন:** সরাসরি Mongoose থেকে মডেলটি অ্যাক্সেস করা হচ্ছে
    const PatientProfile = mongoose.model('PatientProfile');

    console.log(`--- Finding patient with ID: ${patientId}`);
    const patientProfile = await PatientProfile.findById(patientId);

    if (!patientProfile) {
      console.error(`--- FINAL ATTEMPT FAILED: Could not find patient with ID: ${patientId}`);
      return NextResponse.json({ message: 'Patient profile not found.' }, { status: 404 });
    }

    console.log("--- FINAL ATTEMPT SUCCESS: Found patient profile! ---");

    patientProfile.reports.push({ fileName, url });
    await patientProfile.save();
    
    const updatedData = await PatientProfile.findById(patientId).populate('user prescriptions');
    
    console.log("--- SUCCESS: Report added and profile saved. ---");
    return NextResponse.json(updatedData, { status: 200 });

  } catch (error) {
    console.error('--- CRITICAL ERROR in final attempt:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}