// src/app/api/dashboard/doctor/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import PatientProfile from "@/models/PatientProfile.model";
import User from "@/models/User.model";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        await dbConnect();
        const doctorId = session.user.id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // আজকের অ্যাপয়েন্টমেন্টগুলো খোঁজা
        const todaysAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        }).populate({
            path: 'patient',
            model: User,
            select: 'name image'
        }).sort({ appointmentDate: 1 });

        // ডাক্তারের মোট রোগীর সংখ্যা গণনা
        const totalPatients = await PatientProfile.countDocuments({ doctors: doctorId });
        
        const stats = {
            todaysAppointmentsCount: todaysAppointments.length,
            totalPatientsCount: totalPatients,
        };
        // **নতুন:** সম্প্রতি যুক্ত হওয়া রোগীদের খোঁজা হচ্ছে
        const recentPatients = await PatientProfile.find({ doctors: doctorId })
            .sort({ updatedAt: -1 }) // সর্বশেষ আপডেট হওয়া রোগীরা আগে আসবে
            .limit(3) // শুধুমাত্র শেষ ৩ জন রোগী
            .populate({
                path: 'user',
                model: User,
                select: 'name image'
            });

        return NextResponse.json({
            success: true,
            stats,
            todaysAppointments,
            recentPatients, // **নতুন:** রেসপন্সে নতুন ডেটা যোগ করা হয়েছে
        });

    } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}