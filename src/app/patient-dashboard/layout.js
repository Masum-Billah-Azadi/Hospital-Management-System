// src/app/patient-dashboard/layout.js
import { PatientNavbar } from '@/components/patient-dashboard/PatientNavbar';
import PatientSidebar from '@/components/patient-dashboard/PatientSidebar';

export default function PatientDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="lg:hidden sticky top-0 z-50 bg-light-bg dark:bg-dark-bg">
          <div className="p-2"><PatientNavbar /></div>
      </div>
      <div className="flex">
        <div className="hidden lg:block">
          <PatientSidebar />
        </div>
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}