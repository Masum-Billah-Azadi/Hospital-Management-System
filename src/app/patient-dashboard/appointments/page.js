// src/app/patient-dashboard/appointments/page.js
"use client";

import { useState, useEffect } from 'react';
import styles from './MyAppointments.module.scss';

const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch('/api/appointments/patient');
                if (!res.ok) throw new Error('Failed to fetch appointments');
                const data = await res.json();
                setAppointments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (loading) return <p>Loading your appointments...</p>;

    return (
        <div className={styles.container}>
            <h1>My Appointments</h1>
            <p>Here is a list of all your appointments and their status.</p>
            <div className={styles.appointmentList}>
                {appointments.length > 0 ? (
                    appointments.map(app => (
                        <div key={app._id} className={styles.appointmentCard}>
                            <div className={styles.cardHeader}>
                                <h3>Dr. {app.doctor.name}</h3>
                                <span className={`${styles.status} ${styles[app.status]}`}>
                                    {app.status}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p><strong>Date:</strong> {new Date(app.appointmentDate).toLocaleDateString()}</p>
                                <p><strong>Reason:</strong> {app.reason}</p>
                                {app.status === 'accepted' && (
                                    <p className={styles.time}><strong>Scheduled Time:</strong> {app.scheduledTime}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have no appointments.</p>
                )}
            </div>
        </div>
    );
};

export default MyAppointmentsPage;