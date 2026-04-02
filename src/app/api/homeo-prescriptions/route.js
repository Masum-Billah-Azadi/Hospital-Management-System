import dbConnect from "@/lib/dbConnect";
import HomeoPrescription from "@/models/HomeoPrescription.model";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // ✅ medicines ফিল্ডটি রিসিভ করা হচ্ছে
    const {
      patientProfileId,
      doctorId,
      selectedSymptoms,
      repertoryResult,
      medicines,
      generalNotes,
    } = body;

    const newPrescription = await HomeoPrescription.create({
      patientProfile: patientProfileId,
      doctor: doctorId,
      selectedSymptoms,
      repertoryResult,
      medicines, // ডাটাবেসে সেভ করা হচ্ছে
      generalNotes,
    });

    return NextResponse.json(
      {
        message: "Homeo Prescription saved successfully",
        prescription: newPrescription,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving homeo prescription:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { message: "Patient ID is required" },
        { status: 400 },
      );
    }

    const prescriptions = await HomeoPrescription.find({
      patientProfile: patientId,
    })
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(prescriptions, { status: 200 });
  } catch (error) {
    console.error("Error fetching homeo prescriptions:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}
