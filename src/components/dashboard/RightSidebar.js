// src/components/dashboard/RightSidebar.js
"use client";

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import styles from './RightSidebar.module.scss';

// Temporary dummy data for patients
const lastPatients = [
    { name: 'Arya Wijaya Kusuma', date: 'Jan 28, 2020', time: '9 AM - 11 AM', image: '/avatars/avatar-1.jpg' },
    { name: 'Sherly Indriani', date: 'Jan 27, 2020', time: '10 AM - 11 AM', image: '/avatars/avatar-2.jpg' },
    { name: 'Nafiu efandiyar mauludy', date: 'Jan 26, 2020', time: '7 AM - 9 AM', image: '/avatars/avatar-3.jpg' },
];

const RightSidebar = () => {
    const { data: session } = useSession();

    return (
        <aside className={styles.rightSidebar}>
            {/* My Profile Section */}
            <div className={styles.profileCard}>
                <h3>My Profile</h3>
                <div className={styles.profileDetails}>
                    <Image
                        src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}`}
                        alt="Profile"
                        width={60}
                        height={60}
                        className={styles.profileImage}
                    />
                    <h4>Dr. {session?.user?.name}</h4>
                    <p>Cardiologist</p> {/* This can be dynamic later */}
                </div>
            </div>

            {/* Last Patient Section */}
            <div className={styles.lastPatientCard}>
                <div className={styles.cardHeader}>
                    <h3>Last Patient</h3>
                    <a href="#">View All</a>
                </div>
                <ul className={styles.patientList}>
                    {lastPatients.map((patient, index) => (
                        <li key={index} className={styles.patientItem}>
                            <Image
                                src={patient.image}
                                alt={patient.name}
                                width={40}
                                height={40}
                                className={styles.patientImage}
                            />
                            <div className={styles.patientInfo}>
                                <h4>{patient.name}</h4>
                                <p>{patient.date} • {patient.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default RightSidebar;