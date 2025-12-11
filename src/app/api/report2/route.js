// src/app/api/report2/route.js
import { NextResponse } from "next/server";
import getMedicalReportModel from "@/models/MedicalReportFile";

// ========= GET =========
// 1) /api/report2?id=...          -> একটার PDF/ইমেজ stream করবে
// 2) /api/report2?patientName=... -> ঐ patient-এর সব report-এর list
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const patientName = searchParams.get("patientName");

  try {
    const MedicalReportFile = await getMedicalReportModel();

    // ----- 1) single file -----
    if (id) {
      const doc = await MedicalReportFile.findById(id);

      if (!doc) {
        return new NextResponse("Medical report not found", { status: 404 });
      }

      const buffer = Buffer.from(doc.pdf_data, "base64");
      const mimeType = doc.mimeType || "application/pdf";

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${
            doc.fileName || "MedicalReport.pdf"
          }"`,
        },
      });
    }

    // ----- 2) list for a patient -----
    if (!patientName) {
      return NextResponse.json(
        { message: "patientName or id is required" },
        { status: 400 }
      );
    }

    const files = await MedicalReportFile.find({ patient_name: patientName })
      .sort({ created_at: -1 })
      .lean();

    const formatted = files.map((f) => ({
      _id: f._id.toString(),
      patient_name: f.patient_name,
      doctor_name: f.doctor_name,
      disease: f.disease || "",
      createdAt: f.created_at,
      source: f.source || "auto",
      fileName: f.fileName || "MedicalReport.pdf",
      mimeType: f.mimeType || "application/pdf",
      fileUrl: `/api/report2?id=${f._id.toString()}`,
    }));

    return NextResponse.json({ files: formatted }, { status: 200 });
  } catch (err) {
    console.error("GET /api/report2 error:", err);
    return NextResponse.json(
      { message: "Failed to fetch medical reports" },
      { status: 500 }
    );
  }
}

// ========= POST =========
// manual upload (PDF/Image) from doctor portal
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const patientName = form.get("patientName");
    const doctorName = form.get("doctorName") || "Unknown";
    const disease = form.get("disease") || "";

    if (!file || !patientName) {
      return NextResponse.json(
        { message: "File or patient name missing" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const MedicalReportFile = await getMedicalReportModel();

    const saved = await MedicalReportFile.create({
      patient_name: patientName,
      doctor_name: doctorName,
      disease,
      pdf_data: base64,
      mimeType: file.type || "application/pdf",
      fileName: file.name || "MedicalReport.pdf",
      source: "manual",
    });

    return NextResponse.json(
      { success: true, id: saved._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/report2 error:", err);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}

// ========= DELETE =========
// /api/report2?id=...
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "id query param is required" },
      { status: 400 }
    );
  }

  try {
    const MedicalReportFile = await getMedicalReportModel();
    const deleted = await MedicalReportFile.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Medical report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/report2 error:", err);
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}

