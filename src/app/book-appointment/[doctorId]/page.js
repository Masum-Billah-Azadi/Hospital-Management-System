// src/app/book-appointment/[doctorId]/page.js
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Booking.module.scss';

const BookingPage = () => {
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const params = useParams();
    const router = useRouter();
    const { doctorId } = params;

    // নির্দিষ্ট ডাক্তারের তথ্য Fetch করা
    useEffect(() => {
        if (doctorId) {
            const fetchDoctorDetails = async () => {
                try {
                    const res = await fetch(`/api/doctors/${doctorId}`);
                    if (!res.ok) throw new Error('Doctor not found');
                    const data = await res.json();
                    setDoctor(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchDoctorDetails();
        }
    }, [doctorId]);

    // ফর্ম সাবমিট হ্যান্ডলার
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId,
                    appointmentDate: date,
                    reason,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to book appointment.');
            }
            
            setSuccess('Appointment booked successfully! Redirecting...');
            // সফলভাবে বুক হওয়ার পর রোগীকে তার "My Appointments" পেজে পাঠিয়ে দেওয়া হবে
            setTimeout(() => {
                router.push('/patient-dashboard/appointments');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    // આજকের তারিখের আগের তারিখ disable করার জন্য
    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    if (loading) return <p className={styles.message}>Loading...</p>;
    if (!doctor) return <p className={styles.message}>Doctor not found.</p>;

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2>Book an Appointment with <br/> <span>Dr. {doctor.name}</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="date">Select Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={getTodayString()}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reason">Reason for Visit</label>
                        <textarea
                            id="reason"
                            rows="4"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly describe the reason for your appointment"
                            required
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}
                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;