import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Prescription from "@/models/Prescription.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { id } = params;
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return NextResponse.json(
        { message: "Prescription not found" },
        { status: 404 }
      );
    }

    if (!prescription.doctor.equals(session.user.id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prescription.deleteOne();

    return NextResponse.json(
      { message: "Prescription deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete prescription error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
