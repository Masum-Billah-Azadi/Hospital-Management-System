import dbConnect from "@/lib/dbConnect";
import Medicine from "@/models/Medicine.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get('name');

    if (!brandName) {
        return NextResponse.json({ message: "Brand name is required" }, { status: 400 });
    }

    try {
        await dbConnect();

        const medicine = await Medicine.findOne({
            brandName: { $regex: `^${brandName}$`, $options: 'i' }
        });

        if (!medicine) {
            return NextResponse.json({ message: "Medicine not found" }, { status: 404 });
        }

        return NextResponse.json(medicine, { status: 200 });
    } catch (error) {
        console.error("Error fetching medicine details:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}