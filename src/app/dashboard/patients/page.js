// src/app/dashboard/patients/page.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Patients.module.scss';

const MyPatientsPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('/api/patients');
                if (!res.ok) throw new Error('Failed to fetch patients');
                const data = await res.json();
                setPatients(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    if (loading) return <p>Loading patient list...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Patient List</h1>
                {/* <button className={styles.addButton}>Add New Patient</button> */}
            </div>
            
            <div className={styles.tableContainer}>
                <table className={styles.patientsTable}>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length > 0 ? (
                            patients.map(patientProfile => (
                                <tr key={patientProfile._id}>
                                    <td>
                                        <div className={styles.patientInfo}>
                                            <Image 
                                                src={patientProfile.user.image || `https://ui-avatars.com/api/?name=${patientProfile.user.name}`}
                                                alt={patientProfile.user.name}
                                                width={40}
                                                height={40}
                                            />
                                            <span>{patientProfile.user.name}</span>
                                        </div>
                                    </td>
                                    <td>{patientProfile.user.email}</td>
                                    <td>{patientProfile.phone || 'N/A'}</td>
                                    <td>
                                        <Link href={`/dashboard/patients/${patientProfile.user._id}`} className={styles.viewButton}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">You have not added any patients yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyPatientsPage;