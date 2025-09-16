// src/components/dashboard/RightSidebar.js
"use client";

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PatientChart from './PatientChart';
import styles from './RightSidebar.module.scss';

const RightSidebar = () => {
    const { data: session } = useSession();
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [recentPatients, setRecentPatients] = useState([]); // **নতুন:** 최근 환자 목록을 위한 상태

    useEffect(() => {
        if (session) {
            // **পরিবর্তন:** ড্যাশবোর্ডের নতুন API থেকে ডেটা আনা হচ্ছে
            const fetchDashboardData = async () => {
                try {
                    const res = await fetch('/api/dashboard/doctor');
                    if (res.ok) {
                        const data = await res.json();
                        setDoctorProfile(data.doctorProfile); // ডাক্তারের প্রোফাইল সেট করা
                        setRecentPatients(data.recentPatients || []); // **নতুন:** সাম্প্রতিক রোগীদের ডেটা সেট করা
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard data for sidebar", error);
                }
            };
            fetchDashboardData();
        }
    }, [session]);

    return (
        <aside className={styles.rightSidebar}>
            {/* My Profile Section */}
            <div className={styles.profileCard}>
                <div className={styles.profileDetails}>
                    <Image
                        src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}`}
                        alt="Profile"
                        width={80}
                        height={80}
                        className={styles.profileImage}
                    />
                    <h4>Dr. {session?.user?.name}</h4>
                    {/* **পরিবর্তন:** Designation এখন DoctorProfile থেকে আসবে */}
                    <p>{doctorProfile?.designation || 'Specialty'}</p>
                </div>
            </div>

            {/* Last Patient Section */}
            <div className={styles.lastPatientCard}>
                <div className={styles.cardHeader}>
                    <h3>Last Patients</h3>
                    <Link href="/dashboard/patients">View All</Link>
                </div>
                <ul className={styles.patientList}>
                    {/* **পরিবর্তন:** recentPatients থেকে ডাইনামিকভাবে তালিকা তৈরি হচ্ছে */}
                    {recentPatients.length > 0 ? recentPatients.map(patient => (
                        <li key={patient._id} className={styles.patientItem}>
                            <Image
                                src={patient.user?.image || `https://ui-avatars.com/api/?name=${patient.user?.name}`}
                                alt={patient.user?.name}
                                width={40}
                                height={40}
                                className={styles.patientImage}
                            />
                            <div className={styles.patientInfo}>
                                <h4>{patient.user?.name}</h4>
                                <p>Last visit: {new Date(patient.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </li>
                    )) : (
                        <p className={styles.noPatients}>No recent patients.</p>
                    )}
                </ul>
            </div>
            <PatientChart />
        </aside>
    );
};

export default RightSidebar;