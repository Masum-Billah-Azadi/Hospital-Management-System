// src/components/dashboard/Header.js
"use client";

import { useSession } from "next-auth/react";
import Image from 'next/image'; // <-- ১. Image ইম্পোর্ট করো
import styles from './Header.module.scss';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className={styles.header}>
            <div className={styles.welcomeBanner}>
                <h2>Welcome, Dr. {session?.user?.name?.split(' ')[0] || 'User'}</h2>
                <p>Have a nice day at work</p>
            </div>
            <div className={styles.profileSection}>
                <div className={styles.profileIcon}>
                    {/* ২. <img> ট্যাগকে <Image /> দিয়ে পরিবর্তন করো */}
                    <Image 
                        src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=random`} 
                        alt="Profile"
                        width={50} // <-- ৩. width যোগ করো
                        height={50} // <-- ৪. height যোগ করো
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;