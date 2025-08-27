// src/app/patient-dashboard/layout.js
import PatientSidebar from "@/components/patient-dashboard/PatientSidebar";
import styles from './Layout.module.scss';

export default function PatientDashboardLayout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <PatientSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}