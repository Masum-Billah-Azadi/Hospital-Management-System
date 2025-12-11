// src/app/api/prescription2/route.js
import { NextResponse } from "next/server";
import getPrescriptionFileModel from "@/models/PrescriptionFile";

// ========= GET =========
// 1) ?id=...          -> একটার PDF রিটার্ন করবে
// 2) ?patientName=... -> ঐ পেশেন্টের সব ফাইলের list রিটার্ন করবে
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const patientName = searchParams.get("patientName");

  try {
    const PrescriptionFile = await getPrescriptionFileModel();

    // ----- 1) single PDF -----
    if (id) {
      const doc = await PrescriptionFile.findById(id);

      if (!doc) {
        return new NextResponse("Prescription file not found", { status: 404 });
      }

      const buffer = Buffer.from(doc.pdf_data, "base64");
      const mimeType = doc.mimeType || "application/pdf";

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${
            doc.fileName || "prescription.pdf"
          }"`,
        },
      });
    }

    // ----- 2) list -----
    if (!patientName) {
      return NextResponse.json(
        { message: "patientName or id is required" },
        { status: 400 }
      );
    }

    const files = await PrescriptionFile.find({ patient_name: patientName })
      .sort({ created_at: -1 })
      .lean();

    const formatted = files.map((f) => ({
      _id: f._id.toString(),
      patient_name: f.patient_name,
      doctor_name: f.doctor_name,
      createdAt: f.created_at,
      source: f.source || "auto",
      fileName: f.fileName || "Prescription.pdf",
      mimeType: f.mimeType || "application/pdf",
      fileUrl: `/api/prescription2?id=${f._id.toString()}`,
    }));

    return NextResponse.json({ files: formatted }, { status: 200 });
  } catch (err) {
    console.error("GET /api/prescription2 error:", err);
    return NextResponse.json(
      { message: "Failed to fetch prescription files" },
      { status: 500 }
    );
  }
}

// ========= POST =========
// manual upload (PDF/Image)
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const patientName = form.get("patientName");
    const doctorName = form.get("doctorName") || "Unknown";

    if (!file || !patientName) {
      return NextResponse.json(
        { message: "File or patient name missing" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const PrescriptionFile = await getPrescriptionFileModel();

    const saved = await PrescriptionFile.create({
      patient_name: patientName,
      doctor_name: doctorName,
      pdf_data: base64,
      mimeType: file.type || "application/pdf",
      fileName: file.name || "Prescription.pdf",
      source: "manual",
    });

    return NextResponse.json(
      { success: true, id: saved._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/prescription2 error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

// ========= DELETE =========
// /api/prescription2?id=...
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "id is required" },
        { status: 400 }
      );
    }

    const PrescriptionFile = await getPrescriptionFileModel();
    const deleted = await PrescriptionFile.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Prescription file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/prescription2 error:", err);
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}
