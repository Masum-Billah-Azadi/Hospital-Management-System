import dbConnect from "@/lib/dbConnect";
import HomeoRepertory from "@/models/HomeoRepertory.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const repertories = await HomeoRepertory.find().sort({
      order: 1,
      category: 1,
    });
    return NextResponse.json(repertories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data", error: error.message },
      { status: 500 },
    );
  }
}

// ✅ নতুন POST API: ক্যাটাগরি তৈরি এবং লক্ষণ যুক্ত করার জন্য আলাদা লজিক
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, category, order, categoryId, symptomName, medicines } =
      body;

    // ১. শুধুমাত্র নতুন ক্যাটাগরি তৈরি করার জন্য
    if (action === "addCategory") {
      if (!category)
        return NextResponse.json(
          { message: "Category is required" },
          { status: 400 },
        );

      const categoryOrder = order ? Number(order) : 0;
      const newCategory = await HomeoRepertory.create({
        category: category.trim(),
        order: categoryOrder,
        symptoms: [], // শুরুতে কোনো লক্ষণ থাকবে না
      });
      return NextResponse.json(
        { message: "Category added", repertory: newCategory },
        { status: 201 },
      );
    }

    // ২. নির্দিষ্ট ক্যাটাগরিতে নতুন লক্ষণ যুক্ত করার জন্য
    if (action === "addSymptom") {
      if (!categoryId || !symptomName || !medicines) {
        return NextResponse.json(
          { message: "All fields are required" },
          { status: 400 },
        );
      }

      const medicineArray = medicines
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      const repertory = await HomeoRepertory.findById(categoryId);

      if (!repertory)
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 },
        );

      repertory.symptoms.push({
        name: symptomName.trim(),
        medicines: medicineArray,
      });
      await repertory.save();

      return NextResponse.json(
        { message: "Symptom added successfully", repertory },
        { status: 201 },
      );
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      id,
      action,
      newCategoryName,
      order,
      symptomId,
      symptomName,
      medicines,
    } = body;

    if (action === "updateCategory") {
      const updated = await HomeoRepertory.findByIdAndUpdate(
        id,
        { category: newCategoryName, order: Number(order) || 0 },
        { new: true },
      );
      return NextResponse.json(
        { message: "Category updated", updated },
        { status: 200 },
      );
    }

    if (action === "updateSymptom") {
      const medicineArray = medicines
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      const updated = await HomeoRepertory.findOneAndUpdate(
        { _id: id, "symptoms._id": symptomId },
        {
          $set: {
            "symptoms.$.name": symptomName,
            "symptoms.$.medicines": medicineArray,
          },
        },
        { new: true },
      );
      return NextResponse.json(
        { message: "Symptom updated", updated },
        { status: 200 },
      );
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const symptomId = searchParams.get("symptomId");

    if (!id)
      return NextResponse.json({ message: "ID is required" }, { status: 400 });

    if (symptomId) {
      await HomeoRepertory.findByIdAndUpdate(id, {
        $pull: { symptoms: { _id: symptomId } },
      });
      return NextResponse.json(
        { message: "Symptom deleted successfully" },
        { status: 200 },
      );
    } else {
      await HomeoRepertory.findByIdAndDelete(id);
      return NextResponse.json(
        { message: "Category deleted successfully" },
        { status: 200 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
}
