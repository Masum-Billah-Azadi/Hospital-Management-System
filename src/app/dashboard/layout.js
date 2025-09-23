// src/app/dashboard/layout.js
import { DoctorNavbar } from "@/components/dashboard/DoctorNavbar";
import RightSidebar from '@/components/dashboard/RightSidebar';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Mobile Navbar */}
      <div className="lg:hidden p-2">
        <DoctorNavbar />
      </div>
      
      {/* Main Container */}
      <div className="flex gap-4 p-4">
        {/* Left Sidebar (Desktop only) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden lg:block w-full max-w-sm">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}