// src/app/api/profile/doctor/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DoctorProfile from '@/models/DoctorProfile.model';
import User from '@/models/User.model';

// লগইন করা ডাক্তারের প্রোফাইল তথ্য পাওয়ার জন্য
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        // প্রথমে DoctorProfile খোঁজা হচ্ছে
        const profile = await DoctorProfile.findOne({ user: session.user.id });
        
        // User মডেল থেকে বেসিক তথ্য সবসময়ই নেওয়া হচ্ছে
        const user = await User.findById(session.user.id).select('name email image');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // দুটি তথ্য একসাথে করে পাঠানো হচ্ছে
        const fullProfile = {
            name: user.name,
            email: user.email,
            image: user.image,
            phone: profile ? profile.phone : '',
            designation: profile ? profile.designation : '',
            address: profile ? profile.address : '',
        };
        
        return NextResponse.json(fullProfile, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// ডাক্তারের প্রোফাইল তৈরি বা আপডেট করার জন্য
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const data = await request.json();
        const { name, image, phone, designation, address } = data;
        
        // ১. User মডেলের তথ্য (নাম, ছবি) আপডেট করা
        await User.findByIdAndUpdate(session.user.id, { name, image });
        
        // ২. DoctorProfile মডেলের তথ্য (ফোন, পদ, ঠিকানা) আপডেট বা তৈরি করা
        const profileData = { phone, designation, address, user: session.user.id };
        const updatedProfile = await DoctorProfile.findOneAndUpdate(
            { user: session.user.id },
            profileData,
            { new: true, upsert: true } // upsert: true মানে হলো, প্রোফাইল না থাকলে নতুন তৈরি করবে
        );
        
        return NextResponse.json({ message: 'Profile updated successfully', profile: updatedProfile }, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}