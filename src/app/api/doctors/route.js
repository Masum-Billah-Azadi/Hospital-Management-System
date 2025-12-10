// src/app/api/doctor/route.js
import dbConnect from "@/lib/dbConnect";
import DoctorProfile from "@/models/DoctorProfile.model";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await dbConnect();
        
        // URL থেকে 'designation' এবং 'name' query প্যারামিটার নেওয়া হচ্ছে
        const designation = request.nextUrl.searchParams.get('designation');
        const nameSearch = request.nextUrl.searchParams.get('name');

        let queryFilter = {};

        // যদি designation প্যারামিটার থাকে, তাহলে ফিল্টারে যোগ করা হচ্ছে
        if (designation) {
            queryFilter.designation = designation;
        }

        // DoctorProfile থেকে ডাক্তারদের খোঁজা হচ্ছে (প্রাথমিকভাবে ডেজিগনেশন দিয়ে)
        let doctors = await DoctorProfile.find(queryFilter).populate({
            path: 'user',
            model: User,
            select: '-password'
        });

        // যদি নাম দিয়ে সার্চ করা হয়, তাহলে প্রাপ্ত ফলাফল আবার ফিল্টার করা হচ্ছে
        if (nameSearch) {
            const regex = new RegExp(nameSearch, 'i'); // Case-insensitive search
            doctors = doctors.filter(profile => 
                profile.user && regex.test(profile.user.name)
            );
        }

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors list:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}