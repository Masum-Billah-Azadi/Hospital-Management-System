// src/app/book-appointment/[doctorId]/page.js
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Button, Input, Textarea, Spinner, Avatar } from '@material-tailwind/react';

// BookingPage কম্পোনেন্টের বাইরে Layout যোগ করা হয়েছে
const BookingPageLayout = ({ children }) => {
    return (
        <div className="min-h-screen w-full flex justify-center items-center bg-light-bg dark:bg-dark-bg p-4">
            {children}
        </div>
    );
};

const BookingPage = () => {
    // --- আপনার পুরোনো ফাইলের সব state এবং logic ---
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, appointmentDate: date, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to book appointment.');
            setSuccess('Appointment request sent successfully! Redirecting...');
            setTimeout(() => {
                router.push('/patient-dashboard/appointments');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    const getTodayString = () => new Date().toISOString().split("T")[0];

    const content = () => {
        if (loading) return <div className="flex justify-center p-10"><Spinner className="h-12 w-12" /></div>;
        if (!doctor) return <Typography color="red" className="p-10">{error || 'Doctor not found.'}</Typography>;

        return (
            <Card className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <CardBody>
                    <div className="flex flex-col items-center text-center mb-6">
                        <Avatar src={doctor.user.image || `...`} alt={`Dr. ${doctor.user.name}`} size="xxl" className="mb-4" />
                        <Typography variant="h5" color="inherit">Book an Appointment with</Typography>
                        <Typography variant="h4" className="text-light-text-primary dark:text-dark-text-primary font-bold">Dr. {doctor.user.name}</Typography>
                        <Typography color="blue" textGradient>{doctor.designation}</Typography>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <Input crossOrigin={""} type="date" label="Preferred Date" value={date} onChange={(e) => setDate(e.target.value)} required color="blue-gray" className="dark:text-white" min={getTodayString()} />
                        <Textarea label="Reason for Visit" value={reason} onChange={(e) => setReason(e.target.value)} required color="blue-gray" className="dark:text-white" placeholder="Briefly describe the reason for your appointment" />
                        {error && <Typography color="red" className="text-center">{error}</Typography>}
                        {success && <Typography color="green" className="text-center">{success}</Typography>}
                        <Button type="submit" color="blue" fullWidth disabled={submitting}>
                            {submitting ? <Spinner className="h-4 w-4 mx-auto" /> : 'Confirm Appointment Request'}
                        </Button>
                    </form>
                </CardBody>
            </Card>
        );
    };
    
    return <BookingPageLayout>{content()}</BookingPageLayout>;
};

export default BookingPage;