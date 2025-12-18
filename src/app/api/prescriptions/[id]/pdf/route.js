// src/app/api/prescriptions/[id]/pdf/route.js
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model";
import Prescription from "@/models/Prescription.model";
import User from "@/models/User.model";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

// Helper to create medicines rows including duration, freq, instruction, price
const makeMedicinesHtml = (meds) => {
  if (!Array.isArray(meds) || meds.length === 0) {
    return `<tr><td colspan="5">No medicines listed.</td></tr>`;
  }

  return meds
    .map((med, i) => {
      const duration = med.duration
        ? `${med.duration.value || ""} ${med.duration.unit || ""}`
        : "";
      const safe = (v) => (v !== undefined && v !== null ? String(v) : "");
      return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">
          <strong>${safe(med.medicationName)}</strong>
          ${
            med.dosage
              ? `<div style="color:#666;font-size:12px;margin-top:4px;">${safe(
                  med.dosage
                )}</div>`
              : ""
          }
        </td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${safe(
          med.frequency
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${safe(
          med.instruction
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${duration}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${
          med.price ? `৳${safe(med.price)}` : ""
        }</td>
      </tr>
    `;
    })
    .join("");
};

const getHtmlTemplate = (prescription, patient, doctor, qrCodeDataURL) => {
  const medicinesHtml = makeMedicinesHtml(prescription.medications || []);

  // Follow-up display:
  let followUpHtml = "";
  if (
    prescription.followUp &&
    (prescription.followUp.value || prescription.followUp.unit)
  ) {
    const unitMap = {
      day: "day(s)",
      week: "week(s)",
      month: "month(s)",
      continue: "Continue",
    };
    const value = prescription.followUp.value || "";
    const unitStr =
      unitMap[prescription.followUp.unit] || prescription.followUp.unit || "";
    followUpHtml = `<p><strong>Follow-Up:</strong> ${
      value ? `${value} ${unitStr}` : unitStr
    }</p>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Prescription - ${patient.user?.name || "Patient"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        body { font-family: 'Roboto', sans-serif; margin:0; padding:0; color:#222; }
        .page {
          width:210mm;
          padding:16mm;
          box-sizing:border-box;
          min-height:297mm;
          position:relative;

          background-image: url("https://res.cloudinary.com/dv0zvnie6/image/upload/v1762587743/rim4efqgtzqh08chflag.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .doctor { color:#0d2c4b; }
        .doctor h1 { margin:0; font-size:22px; }
        .doctor p { margin:2px 0 0; color:#555; font-size:12px; }
        .qr { width:90px; height:90px; }
        .patient-info { display:grid; grid-template-columns:repeat(3,1fr); gap:8px 16px; margin-top:8px; padding-bottom:8px; border-bottom:1px solid #eee; font-size:13px; }
        .rx { margin-top:18px; display:flex; gap:18px; }
        .rx-symbol { font-size:38px; color:#1e88e5; font-weight:700; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th, td { text-align:left; padding:8px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
        th { background:#fafafa; font-weight:600; color:#333; }
        .notes { margin-top:18px; font-size:13px; line-height:1.4; color:#333; }
        .footer { position:absolute; bottom:20mm; left:16mm; right:16mm; display:flex; justify-content:space-between; align-items:center; }
        .signature { text-align:right; }
        .meta { color:#666; font-size:12px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="doctor">
            <h1>Dr. ${doctor.name}</h1>
            <p>${doctor.qualification || ""}</p>
          </div>
          <div>
            <img src="${qrCodeDataURL}" alt="QR" class="qr" />
          </div>
        </div>

        <div class="patient-info">
          <div><strong>Patient:</strong> ${patient.user?.name || ""}</div>
          <div><strong>Date:</strong> ${new Date(
            prescription.createdAt
          ).toLocaleDateString()}</div>
          <div><strong>Follow-Up:</strong> ${
            prescription.followUp && prescription.followUp.value
              ? `${prescription.followUp.value} ${
                  prescription.followUp.unit || ""
                }`
              : prescription.followUp && prescription.followUp.unit
              ? prescription.followUp.unit
              : "N/A"
          }</div>
          <div><strong>Age:</strong> ${patient.age || "N/A"}</div>
          <div><strong>Weight:</strong> ${
            patient.weight ? patient.weight : "N/A"
          }</div>
          <div><strong>Gender:</strong> ${patient.gender || "N/A"}</div>
          <div><strong>Phone:</strong> ${patient.phone || "N/A"}</div>
          <div><strong>Address:</strong> ${patient.address || "N/A"}</div>
          <div><strong>Blood Group:</strong> ${
            patient.bloodGroup || "N/A"
          }</div>
        </div>

        <div class="rx">
          <div class="rx-symbol">℞</div>
          <div style="flex:1;">
            <table>
              <thead>
                <tr>
                  <th style="width:40%;">Name & Dosage</th>
                  <th style="width:15%;">Frequency</th>
                  <th style="width:20%;">Instruction</th>
                  <th style="width:15%;">Duration</th>
                  <th style="width:10%;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${medicinesHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="notes">
          ${
            prescription.generalNotes
              ? `<p><strong>Notes:</strong> ${prescription.generalNotes}</p>`
              : ""
          }
          ${
            prescription.suggestedReports &&
            prescription.suggestedReports.length > 0
              ? `<p><strong>Reports:</strong> ${prescription.suggestedReports.join(
                  ", "
                )}</p>`
              : ""
          }
          ${followUpHtml}
        </div>

        <div class="footer">
          <div class="meta">
            ${doctor.address || ""}<br/>
            ${doctor.phone || ""}
          </div>
          <div class="signature">
            <div>________________________</div>
            <div><strong>Signature</strong></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    // load prescription
    const prescription = await Prescription.findById(id).lean();
    if (!prescription)
      return NextResponse.json(
        { message: "Prescription not found" },
        { status: 404 }
      );

    // load patient profile (and user)
    const patient = await PatientProfile.findById(prescription.patientProfile)
      .populate("user", "_id name phone")
      .lean();
    if (!patient)
      return NextResponse.json(
        { message: "Patient profile not found" },
        { status: 404 }
      );

    // load doctor (for contact & qualification)
    const doctor = await User.findById(prescription.doctor)
      .select("name qualification address phone")
      .lean();
    if (!doctor)
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );

    const patientProfileUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/dashboard/patients/${patient.user?._id || ""}`;
    const qrCodeDataURL = await QRCode.toDataURL(patientProfileUrl || "");

    const htmlContent = getHtmlTemplate(
      prescription,
      patient,
      doctor,
      qrCodeDataURL
    );

    // PDFShift API call
    const authString = `api:${process.env.PDFSHIFT_API_KEY}`;
    const apiKey = Buffer.from(authString).toString("base64");

    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: htmlContent,
        landscape: false,
        use_print: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("PDFShift API Error:", response.status, errorBody);
      throw new Error(`PDFShift API failed with status: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prescription-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { message: "Server error during PDF generation" },
      { status: 500 }
    );
  }
}
