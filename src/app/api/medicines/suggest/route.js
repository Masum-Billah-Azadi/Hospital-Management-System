import dbConnect from "@/lib/dbConnect";
import Medicine from "@/models/Medicine.model";
import { NextResponse } from "next/server";

const PAGE_SIZE = 10;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!query || query.length < 3) {
        return NextResponse.json({ suggestions: [], hasMore: false }, { status: 200 });
    }

    try {
        await dbConnect();
        const skip = (page - 1) * PAGE_SIZE;

        const suggestions = await Medicine.find(
            { $text: { $search: query } },
            { 
                score: { $meta: "textScore" }, 
                brandName: 1, 
                strength: 1, 
                genericName: 1, 
                price: 1,
                rating: 1 // rating যোগ করা হয়েছে
            }
        )
        // .sort({ score: { $meta: "textScore" }, rating: -1 })
        .sort({ rating: -1 })
        .skip(skip)
        .limit(PAGE_SIZE);

        let totalCount = 0;
        if (page === 1) {
            totalCount = await Medicine.countDocuments({ $text: { $search: query } });
        }
        const hasMore = (skip + suggestions.length) < totalCount || (page > 1 && suggestions.length === PAGE_SIZE);

        return NextResponse.json({ suggestions, hasMore }, { status: 200 });
    } catch (error) {
        console.error("Error fetching medicine suggestions:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}