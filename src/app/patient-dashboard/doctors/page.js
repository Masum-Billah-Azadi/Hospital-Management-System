// src/app/patient-dashboard/doctors/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Doctors.module.scss';

const FindDoctorsPage = () => {
    const [doctorProfiles, setDoctorProfiles] = useState([]); // **পরিবর্তন:** state এর নাম পরিবর্তন
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/doctors');
                const data = await res.json();
                // **পরিবর্তন:** শুধুমাত্র সেই প্রোফাইলগুলো ফিল্টার করা হচ্ছে যাদের user তথ্য আছে
                setDoctorProfiles(data.filter(profile => profile.user));
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    if (loading) return <p className={styles.message}>Loading doctors...</p>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>Find Your Doctor</h1>
                <p>Choose from our list of expert medical professionals.</p>
            </header>
            <main className={styles.doctorsGrid}>
                {doctorProfiles.length > 0 ? doctorProfiles.map(profile => (
                    <div key={profile._id} className={styles.doctorCard}>
                        <Image
                            // **পরিবর্তন:** profile.user.image থেকে ছবি নেওয়া হচ্ছে
                            src={profile.user.image || `https://ui-avatars.com/api/?name=${profile.user.name.replace(/\s/g, '+')}&background=random`}
                            alt={`Dr. ${profile.user.name}`}
                            width={100}
                            height={100}
                            className={styles.doctorAvatar}
                        />
                        {/* **পরিবর্তন:** profile.user.name থেকে নাম নেওয়া হচ্ছে */}
                        <h3>Dr. {profile.user.name}</h3>
                        
                        {/* **মূল পরিবর্তন:** ডেজিগনেশন এখন ডাইনামিক */}
                        <p className={styles.specialty}>{profile.designation || 'Doctor'}</p>
                        
                        {/* **পরিবর্তন:** profile.user._id দিয়ে লিঙ্ক তৈরি হচ্ছে */}
                        <Link href={`/book-appointment/${profile.user._id}`} className={styles.bookButton}>
                            Book Appointment
                        </Link>
                    </div>
                )) : <p className={styles.message}>No doctors available at the moment.</p>}
            </main>
        </div>
    );
};

export default FindDoctorsPage;