// src/app/api/dashboard/doctor/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment.model";
import DoctorProfile from "@/models/DoctorProfile.model"; // **নতুন:** DoctorProfile মডেল ইম্পোর্ট করুন
import PatientProfile from "@/models/PatientProfile.model";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        await dbConnect();
        const doctorId = session.user.id;

        // --- stats, todaysAppointments, recentPatients-এর কোড অপরিবর্তিত থাকবে ---
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todaysAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        }).populate({ path: 'patient', model: User, select: 'name image' }).sort({ appointmentDate: 1 });

        const totalPatients = await PatientProfile.countDocuments({ doctors: doctorId });
        
        const recentPatients = await PatientProfile.find({ doctors: doctorId })
            .sort({ updatedAt: -1 })
            .limit(3)
            .populate({ path: 'user', model: User, select: 'name image' });
        
        const stats = {
            todaysAppointmentsCount: todaysAppointments.length,
            totalPatientsCount: totalPatients,
        };

        // **নতুন:** ডাক্তারের নিজের প্রোফাইল তথ্য খোঁজা হচ্ছে
        const doctorProfile = await DoctorProfile.findOne({ user: doctorId });

        return NextResponse.json({
            success: true,
            stats,
            todaysAppointments,
            recentPatients,
            doctorProfile // **নতুন:** রেসপন্সে প্রোফাইল যোগ করা হয়েছে
        });

    } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
