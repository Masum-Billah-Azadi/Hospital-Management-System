// src/components/patient-dashboard/PatientSidebar.js
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './PatientSidebar.module.scss';

const navLinks = [
    { href: "/patient-dashboard", label: "Dashboard" },
    { href: "/patient-dashboard/doctors", label: "Find a Doctor" },
    { href: "/patient-dashboard/appointments", label: "My Appointments" },
];

const PatientSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>Patient Portal</div>
            <nav className={styles.nav}>
                <ul>
                    {navLinks.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href} className={isActive ? styles.active : ''}>
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        );
                    })}
                     <li>
                        <a href="http://anirban.lovestoblog.com/" target="_blank" rel="noopener noreferrer">
                            Blood Bank & Donation
                        </a>
                    </li>
                </ul>
            </nav>
            <div className={styles.logout}>
                <button onClick={() => signOut({ callbackUrl: '/' })}>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default PatientSidebar;