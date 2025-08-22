// src/components/dashboard/Sidebar.js
"use client"; // Add this line at the top

import Link from 'next/link';
import styles from './Sidebar.module.scss';
import { signOut } from 'next-auth/react';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/dashboard">DocPortal</Link>
            </div>
            <nav className={styles.nav}>
                <ul>
                    <li className={styles.active}><Link href="/dashboard">🏠 Dashboard</Link></li>
                    <li><Link href="/dashboard/appointments">📅 Appointments</Link></li>
                    <li><Link href="/dashboard/patients">👥 Patients</Link></li>
                    <li><Link href="/dashboard/profile">⚙️ Profile</Link></li>
                </ul>
            </nav>
            <div className={styles.logout}>
                <button onClick={() => signOut({ callbackUrl: '/login' })}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;