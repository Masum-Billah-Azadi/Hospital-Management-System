// src/app/patient-dashboard/appointments/page.js
"use client";

import { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Chip, Spinner, Avatar } from '@material-tailwind/react';

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

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending': return 'amber';
            case 'accepted': return 'green';
            case 'rejected': return 'red';
            default: return 'blue-gray';
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner className="h-12 w-12" /></div>;

    return (
        <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
            <CardBody>
                <Typography variant="h5" color="inherit" className="mb-6 text-light-text-primary dark:text-dark-text-primary">
                    My Appointments
                </Typography>
                <div className="flex flex-col gap-4">
                    {appointments.length > 0 ? (
                        appointments.slice().reverse().map(app => (
                            <Card key={app._id} className="p-4 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        {/* FIX 1: ডাক্তারের ছবির জন্য সঠিক পাথ */}
                                        <Avatar src={app.doctor?.image || `https://ui-avatars.com/api/?name=${app.doctor?.name.replace(/\s/g, '+')}`} alt={`Dr. ${app.doctor?.name}`} />
                                        <div>
                                            {/* FIX 2: ডার্ক মোডের জন্য টেক্সটের রঙ */}
                                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Dr. {app.doctor?.name}</Typography>
                                            <Typography variant="small" className="text-light-text-secondary dark:text-dark-text-secondary">
                                                {new Date(app.appointmentDate).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Chip value={app.status} color={getStatusChipColor(app.status)} className="capitalize" />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                    {/* FIX 2: ডার্ক মোডের জন্য টেক্সটের রঙ */}
                                    <Typography variant="small" className="text-light-text-primary dark:text-dark-text-primary">
                                        <strong>Reason:</strong> {app.reason}
                                    </Typography>
                                    {app.status === 'accepted' && (
                                        <Typography variant="small" color="green" className="font-bold mt-1">
                                            <strong>Time:</strong> {app.scheduledTime}
                                        </Typography>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Typography className="text-center p-10 opacity-70">
                            You have no appointments.
                        </Typography>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default MyAppointmentsPage;