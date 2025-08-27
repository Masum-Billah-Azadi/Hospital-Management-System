// src/components/dashboard/Sidebar.js
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ১. usePathname ইম্পোর্ট করো
import { signOut } from 'next-auth/react';
import styles from './Sidebar.module.scss';

// ২. নেভিগেশন লিঙ্কগুলোকে একটি অ্যারেতে রাখি
const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/dashboard/appointments", label: "Appointments", icon: "📅" },
    { href: "/dashboard/patients", label: "Patients", icon: "👥" },
    { href: "/dashboard/profile", label: "Profile", icon: "⚙️" },
];

const Sidebar = () => {
    const pathname = usePathname(); // ৩. বর্তমান পাথ বা URL পাওয়া

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/dashboard">DocPortal</Link>
            </div>
            <nav className={styles.nav}>
                <ul>
                    {navLinks.map(link => {
                        // ৪. বর্তমান পাথের সাথে লিঙ্কের href মিলিয়ে দেখা
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href} className={isActive ? styles.active : ''}>
                                <Link href={link.href}>{link.icon} {link.label}</Link>
                            </li>
                        );
                    })}
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