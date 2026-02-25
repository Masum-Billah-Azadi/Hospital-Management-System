// src/app/admin/dashboard/layout.js
import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* ডেস্কটপের জন্য সাইডবার */}
      <div className="hidden lg:block z-50">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* মোবাইলের জন্য ন্যাভবার */}
        <AdminNavbar />

        {/* মেইন কনটেন্ট এরিয়া (যেখানে refunds, profile ইত্যাদি লোড হবে) */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
