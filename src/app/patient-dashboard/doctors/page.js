// src/app/patient-dashboard/doctors/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Doctors.module.scss';

const FindDoctorsPage = () => {
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
                <h1>Find Your Doctor</h1>
                <p>Choose from our list of expert medical professionals.</p>
            </header>
            <main className={styles.doctorsGrid}>
                {doctors.length > 0 ? doctors.map(doctor => (
                    <div key={doctor._id} className={styles.doctorCard}>
                        <Image
                            src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.name.replace(/\s/g, '+')}&background=random`}
                            alt={`Dr. ${doctor.name}`}
                            width={100}
                            height={100}
                            className={styles.doctorAvatar}
                        />
                        <h3>Dr. {doctor.name}</h3>
                        <p className={styles.specialty}>General Physician</p>
                        <Link href={`/book-appointment/${doctor._id}`} className={styles.bookButton}>
                            Book Appointment
                        </Link>
                    </div>
                )) : <p className={styles.message}>No doctors available at the moment.</p>}
            </main>
        </div>
    );
};

export default FindDoctorsPage;