// src/app/dashboard/layout.js
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import RightSidebar from '@/components/dashboard/RightSidebar';
import styles from './Layout.module.scss';

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.contentWrapper}> {/* ২. একটি নতুন wrapper যোগ করো */}
        <Header />
        <main className={styles.mainContent}>
            {children}
        </main>
      </div>
      <RightSidebar /> {/* ৩. RightSidebar কম্পোনেন্ট যোগ করো */}
    </div>
  );
}