// src/app/patient-dashboard/layout.js
import PatientSidebar from '@/components/patient-dashboard/PatientSidebar';
import styles from './PatientDashboardLayout.module.scss'; // একটি নতুন SCSS ফাইল

export default function PatientDashboardLayout({ children }) {
  return (
    <div className={styles.dashboardContainer}>
      <PatientSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}