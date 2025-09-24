// src/app/api/prescriptions/[id]/pdf/route.js
import dbConnect from '@/lib/dbConnect';
import PatientProfile from '@/models/PatientProfile.model';
import Prescription from '@/models/Prescription.model';
import User from '@/models/User.model';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

// নতুন ডিজাইন অনুযায়ী HTML টেমপ্লেট
const getHtmlTemplate = (prescription, patient, doctor, qrCodeDataURL) => {
    const medicinesHtml = prescription.medications.map(med => `
        <tr>
            <td>${med.medicationName}</td>
            <td>${med.dosage}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Prescription - ${patient.user.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                body {
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #fff;
                    color: #333;
                    font-size: 14px;
                }
                .page {
                    width: 210mm;
                    height: 297mm;
                    padding: 15mm;
                    box-sizing: border-box;
                    position: relative;
                    overflow: hidden;
                }
                .header-bg {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 40%;
                    height: 120px;
                    background-color: #0d2c4b;
                    clip-path: polygon(100% 0, 100% 100%, 25% 100%, 0 0);
                }
                .header-accent {
                    position: absolute;
                    top: 0;
                    right: 25%;
                    width: 20%;
                    height: 100px;
                    background-color: #1e88e5;
                    clip-path: polygon(100% 0, 100% 100%, 25% 100%, 0 0);
                }
                .header-content {
                    position: relative;
                    z-index: 10;
                    padding: 20px 0;
                }
                .doctor-name {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0d2c4b;
                }
                .doctor-qual {
                    font-size: 16px;
                    color: #555;
                    margin-top: 4px;
                }
                .patient-info {
                    margin-top: 30px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px 20px;
                }
                .info-item { display: flex; }
                .info-item strong { width: 80px; }
                .rx-section { margin-top: 20px; }
                .rx-symbol {
                    font-size: 4em;
                    font-weight: bold;
                    color: #1e88e5;
                    float: left;
                    margin-right: 15px;
                }
                .medication-table {
                    width: calc(100% - 70px);
                    border-collapse: collapse;
                    float: left;
                }
                .medication-table th, .medication-table td {
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .medication-table th { font-weight: 500; color: #333; }
                .notes-reports {
                    clear: both;
                    padding-top: 20px;
                    margin-top: 20px;
                    border-top: 1px solid #eee;
                }
                .footer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100px;
                    overflow: hidden;
                }
                .footer-bg {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 40%;
                    height: 120px;
                    background-color: #0d2c4b;
                    clip-path: polygon(0 100%, 75% 0, 100% 0, 100% 100%);
                }
                .footer-accent {
                    position: absolute;
                    bottom: 0;
                    left: 25%;
                    width: 20%;
                    height: 100px;
                    background-color: #1e88e5;
                    clip-path: polygon(0 100%, 75% 0, 100% 0, 100% 100%);
                }
                .footer-content {
                    position: absolute;
                    bottom: 15mm;
                    right: 15mm;
                    text-align: right;
                }
                .signature { margin-bottom: 5px; }
                .contact-info { font-size: 12px; }
                .qr-code { position: absolute; top: 15mm; right: 15mm; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="header-bg"></div>
                <div class="header-accent"></div>
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" width="80" height="80">
                
                <div class="header-content">
                    <div class="doctor-name">Dr. ${doctor.name}</div>
                    <div class="doctor-qual">${doctor.qualification || 'Doctor Qualification'}</div>
                </div>

                <div class="patient-info">
                    <div class="info-item"><strong>Patient:</strong> ${patient.user.name}</div>
                    <div class="info-item"><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</div>
                    <div class="info-item"><strong>Age:</strong> ${patient.age || 'N/A'}</div>
                    <div class="info-item"><strong>Weight:</strong> ${patient.weight ? `${patient.weight} KG` : 'N/A'}</div>
                    <div class="info-item"><strong>Gender:</strong> ${patient.gender || 'N/A'}</div>
                    <div class="info-item"><strong>Diagnosis:</strong> ${patient.diagnosis || 'N/A'}</div>
                </div>

                <div class="rx-section">
                    <div class="rx-symbol">℞</div>
                    <table class="medication-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Dosage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medicinesHtml}
                        </tbody>
                    </table>
                </div>

                <div class="notes-reports">
                    ${prescription.generalNotes ? `<p><strong>Notes:</strong> ${prescription.generalNotes}</p>` : ''}
                    ${(prescription.suggestedReports && prescription.suggestedReports.length > 0) ? `<p><strong>Reports:</strong> ${prescription.suggestedReports.join(', ')}</p>` : ''}
                </div>

                <div class="footer">
                    <div class="footer-bg"></div>
                    <div class="footer-accent"></div>
                    <div class="footer-content">
                        <div class="signature">_________________________<br><strong>Signature</strong></div>
                        <div class="contact-info">
                            ${doctor.address || '24 Dummy Street Area'}<br>
                            ${doctor.phone || '+12-345 678 9012'}
                        </div>
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

        // ডেটা খোঁজার কোড
        const prescription = await Prescription.findById(id).lean();
        if (!prescription) return NextResponse.json({ message: "Prescription not found" }, { status: 404 });
        
        const patient = await PatientProfile.findById(prescription.patientProfile).populate('user', '_id name').lean();
        if (!patient) return NextResponse.json({ message: "Patient profile not found" }, { status: 404 });

        const doctor = await User.findById(prescription.doctor).select('name qualification').lean();
        if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
        
        const patientProfileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/patients/${patient.user._id}`;
        const qrCodeDataURL = await QRCode.toDataURL(patientProfileUrl);

        const htmlContent = getHtmlTemplate(prescription, patient, doctor, qrCodeDataURL);

        // **PDFShift API কল**
        const authString = `api:${process.env.PDFSHIFT_API_KEY}`;
        const apiKey = Buffer.from(authString).toString('base64');

        const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: htmlContent,
                landscape: false,
                use_print: false,
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("PDFShift API Error:", errorBody);
            throw new Error(`PDFShift API failed with status: ${response.status}`);
        }

        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
            },
        });

    } catch (error) {
        console.error("PDF generation error with PDFShift:", error);
        return NextResponse.json({ message: 'Server error during PDF generation' }, { status: 500 });
    }
}