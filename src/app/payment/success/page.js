"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your appointment request has been confirmed.
        </p>

        <div className="bg-gray-100 p-4 rounded mb-6 text-left text-sm">
          <p>
            <strong>Transaction ID:</strong> {tran_id}
          </p>
          <p>
            <strong>Status:</strong> Paid
          </p>
        </div>

        <Link href="/patient-dashboard/appointments">
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            View My Appointments
          </button>
        </Link>
      </div>
    </div>
  );
}
