// src/app/api/medicines/suggest/route.js
import dbConnect from "@/lib/dbConnect";
import Medicine from "@/models/Medicine.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        await dbConnect();

        // পরিবর্তন: Regex-এর পরিবর্তে এখন $text search ব্যবহার করা হচ্ছে
        const suggestions = await Medicine.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } } // Relevance অনুযায়ী ফলাফলের score
        )
        .sort({ score: { $meta: "textScore" } }) // সবচেয়ে প্রাসঙ্গিক ফলাফল আগে দেখানো হবে
        .limit(10);

        return NextResponse.json(suggestions, { status: 200 });
    } catch (error) {
        console.error("Error fetching medicine suggestions:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}