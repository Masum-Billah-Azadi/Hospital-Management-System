//src/app/api/admin/users/[userId]/route.js
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { userId } = params;
        const { role } = await request.json();

        await dbConnect();
        await User.findByIdAndUpdate(userId, { role });

        return NextResponse.json({ success: true, message: "User role updated successfully." });
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}