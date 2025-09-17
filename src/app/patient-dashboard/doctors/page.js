// src/app/patient-dashboard/doctors/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import styles from './Doctors.module.scss';

// **নতুন:** ডেজিগনেশনগুলোর তালিকা
const specialties = [
    "MEDICINE", "OBSTETRICS & GYNECOLOGY", "PAEDIATRIC MEDICINE", 
    "GENERAL & LAPAROSCOPIC SURGERY", "ORTHOPEDICS", "CARDIOLOGY", 
    "ENT", "NEURO MEDICINE", "RADIOLOGY & IMAGING", "ONCOLOGY"
];

const FindDoctorsPage = () => {
    const [doctorProfiles, setDoctorProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // **পরিবর্তন:** দুটি আলাদা state ফিল্টারের জন্য
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            // API URL-এ দুটি প্যারামিটারই যোগ করা হয়েছে
            const res = await fetch(`/api/doctors?designation=${encodeURIComponent(selectedDesignation)}&name=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            setDoctorProfiles(data.filter(profile => profile.user));
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    }, [selectedDesignation, searchTerm]); // dependency পরিবর্তন করা হয়েছে

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>Find Your Doctor</h1>
                {/* **নতুন:** ফিল্টার সেকশন */}
                <div className={styles.filters}>
                    <select 
                        className={styles.dropdown}
                        value={selectedDesignation}
                        onChange={(e) => setSelectedDesignation(e.target.value)}
                    >
                        <option value="">All Specialties</option>
                        {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className={styles.searchBox}
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>
            <main className={styles.doctorsGrid}>
                {loading ? (
                    <p className={styles.message}>Loading doctors...</p>
                ) : (
                    doctorProfiles.length > 0 ? doctorProfiles.map(profile => (
                        <div key={profile._id} className={styles.doctorCard}>
                            <Image
                                src={profile.user.image || `https://ui-avatars.com/api/?name=${profile.user.name.replace(/\s/g, '+')}&background=random`}
                                alt={`Dr. ${profile.user.name}`}
                                width={100}
                                height={100}
                                className={styles.doctorAvatar}
                            />
                            <h3>Dr. {profile.user.name}</h3>
                            <p className={styles.specialty}>{profile.designation || 'Doctor'}</p>
                            <Link href={`/book-appointment/${profile.user._id}`} className={styles.bookButton}>
                                Book Appointment
                            </Link>
                        </div>
                    )) : <p className={styles.message}>No doctors found matching your criteria.</p>
                )}
            </main>
        </div>
    );
};

export default FindDoctorsPage;