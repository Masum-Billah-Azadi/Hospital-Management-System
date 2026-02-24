import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // পাথ ঠিক আছে কিনা চেক করবেন
import Payment from "@/models/Payment.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  // ১. আপনার পুরোনো কোডের মতোই সেশন চেক করা হচ্ছে
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }

  try {
    const {
      amount,
      patientName,
      patientEmail,
      mobile,
      appointmentId,
      appointmentDate,
      timeSlot,
      reason,
    } = await req.json();

    await mongoose.connect(process.env.MONGODB_URI);

    // ২. ইউনিক ট্রানজেকশন আইডি
    const tran_id = uuidv4();

    // ৩. পেমেন্ট ডাটা সেভ (এখানে আমরা সেশন থেকে আইডি নিচ্ছি!)
    await Payment.create({
      transactionId: tran_id,
      amount: amount,
      customerName: patientName,
      customerEmail: patientEmail,
      mobile: mobile,
      status: "PENDING",

      // --- সেশন এবং রিকোয়েস্ট থেকে ডাটা ---
      patientId: session.user.id, // ✅ পুরোনো কোডের সেই ম্যাজিক লাইন!
      doctorId: appointmentId,
      appointmentDate: appointmentDate,
      timeSlot: timeSlot,
      reason: reason,
    });

    // ৪. SSLCommerz কনফিগারেশন
    const initData = {
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASSWORD,
      total_amount: amount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/success?tran_id=${tran_id}`,
      fail_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_API_URL}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Doctor Appointment",
      product_category: "Service",
      product_profile: "general",
      cus_name: patientName,
      cus_email: patientEmail || session.user.email,
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: mobile || "01711111111",
      cus_fax: "01711111111",
      ship_name: "Hospital System",
      ship_add1: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    const sslUrl =
      process.env.IS_LIVE === "true"
        ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
        : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    const formBody = new URLSearchParams(initData);
    const response = await fetch(sslUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    const data = await response.json();

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return NextResponse.json({ url: data.GatewayPageURL });
    } else {
      return NextResponse.json(
        { error: "Failed to generate payment link" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Payment Init Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
