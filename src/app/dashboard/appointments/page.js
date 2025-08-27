// src/app/dashboard/appointments/page.js
"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal'; // ১. Modal ইম্পোর্ট করো
import styles from './Appointments.module.scss';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [scheduledTime, setScheduledTime] = useState('');

    // ডেটা Fetch করার ফাংশন
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/appointments/doctor');
            if (!res.ok) throw new Error('Failed to fetch appointments');
            const data = await res.json();
            setAppointments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);
    
    // স্ট্যাটাস আপডেট করার ফাংশন
    const handleUpdateStatus = async (appointmentId, status, time = null) => {
        try {
            const res = await fetch('/api/appointments/update-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    appointmentId, 
                    status, 
                    scheduledTime: time 
                }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            // UI আপডেট করা
            if (status === 'rejected') {
                // Reject হলে লিস্ট থেকে বাদ দেওয়া
                setAppointments(prev => prev.filter(app => app._id !== appointmentId));
            } else {
                // Accept হলে লিস্ট আপডেট করা
                setAppointments(prev => 
                    prev.map(app => 
                        app._id === appointmentId ? { ...app, status, scheduledTime: time } : app
                    )
                );
            }

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Accept বাটন ক্লিক হ্যান্ডলার
    const handleAcceptClick = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    // Modal সাবমিট হ্যান্ডলার
    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (!scheduledTime) {
            alert("Please set a time.");
            return;
        }
        handleUpdateStatus(selectedAppointment._id, 'accepted', scheduledTime);
        closeModal();
    };
    
    // Modal বন্ধ করার ফাংশন
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setScheduledTime('');
    };

    if (loading) return <p>Loading appointments...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <div className={styles.appointmentsContainer}>
                <h1>My Appointments</h1>
                <table className={styles.appointmentsTable}>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map(app => (
                                <tr key={app._id}>
                                    <td>{app.patient.name}</td>
                                    <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
                                    <td>{app.reason}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[app.status]}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        {app.status === 'pending' && (
                                            <>
                                                <button className={styles.acceptBtn} onClick={() => handleAcceptClick(app)}>Accept</button>
                                                <button className={styles.rejectBtn} onClick={() => handleUpdateStatus(app._id, 'rejected')}>Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No pending appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Accept করার জন্য Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2>Set Appointment Time</h2>
                {selectedAppointment && <p>For: {selectedAppointment.patient.name}</p>}
                <form onSubmit={handleModalSubmit} className={styles.modalForm}>
                    <input
                        type="text"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        placeholder="e.g., 3:00 PM - 3:30 PM"
                        required
                    />
                    <button type="submit">Confirm Appointment</button>
                </form>
            </Modal>
        </>
    );
};

export default AppointmentsPage;