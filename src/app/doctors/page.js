// src/app/doctors/page.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Doctors.module.scss';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/doctors');
                const data = await res.json();
                setDoctors(data);
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
                <h1>Our Expert Doctors</h1>
                <p>Choose a doctor and book your appointment today.</p>
            </header>
            <main className={styles.doctorsGrid}>
                {doctors.length > 0 ? doctors.map(doctor => (
                    <div key={doctor._id} className={styles.doctorCard}>
                        <Image
                            src={`https://ui-avatars.com/api/?name=${doctor.name.replace(/\s/g, '+')}&background=random`}
                            alt={`Dr. ${doctor.name}`}
                            width={100}
                            height={100}
                            className={styles.doctorAvatar}
                        />
                        <h3>Dr. {doctor.name}</h3>
                        <p className={styles.specialty}>General Physician</p>
                        <Link href={`/book/${doctor._id}`} className={styles.bookButton}>
                            Book Appointment
                        </Link>
                    </div>
                )) : <p className={styles.message}>No doctors available at the moment.</p>}
            </main>
        </div>
    );
};

export default DoctorsPage;