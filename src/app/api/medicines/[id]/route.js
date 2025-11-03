import dbConnect from "@/lib/dbConnect";
import Medicine from "@/models/Medicine.model";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
// Important: Add authentication checks if needed (e.g., ensure only doctors can update)
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    /* // Uncomment this section to add authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'doctor') {
         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    */
    
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid Medicine ID format" }, { status: 400 });
    }

    // Rating ভ্যালিডেশন (যদি পাঠানো হয়)
    if (body.rating !== undefined) {
        const rating = Number(body.rating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
            return NextResponse.json({ message: "Invalid rating value (must be 0-5)" }, { status: 400 });
        }
        body.rating = rating;
    }

    try {
        await dbConnect();

        // শুধুমাত্র পাঠানো ফিল্ডগুলো আপডেট করা হবে ($set ব্যবহার করে)
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true } // আপডেটেড ডকুমেন্ট ফেরত দেবে এবং স্কিমা ভ্যালিডেশন চালাবে
        );

        if (!updatedMedicine) {
            return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
        }

        console.log("Medicine Updated:", updatedMedicine); // Optional: Log updated data
        return NextResponse.json(updatedMedicine, { status: 200 });
    } catch (error) {
        console.error("Error updating medicine:", error);
        // Provide more details in development for easier debugging
        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : "Server error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// আপনি চাইলে GET রুটও যোগ করতে পারেন একটি নির্দিষ্ট মেডিসিনের সব তথ্য আনার জন্য
// GET /api/medicines/[id]
export async function GET(request, { params }) {
     const { id } = params;
     if (!mongoose.Types.ObjectId.isValid(id)) {
         return NextResponse.json({ message: "Invalid Medicine ID format" }, { status: 400 });
     }
     try {
        await dbConnect();
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
        }
        return NextResponse.json(medicine, { status: 200 });
    } catch (error) {
        console.error("Error fetching medicine by ID:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}