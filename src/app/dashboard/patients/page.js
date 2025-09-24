// src/app/dashboard/patients/page.js
"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Typography
} from '@material-tailwind/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner className="h-12 w-12" /></div>;

    return (
        <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
            <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {/* FIX 1: Explicit theme-aware color class added here */}
                    <Typography variant="h5" className="text-light-text-primary dark:text-dark-text-primary">
                        My Patient List
                    </Typography>
                    {/* FIX 2: Button text is now hidden on extra-small screens */}
                    <Button color="blue" className="flex items-center gap-2">
                        <PlusIcon className="h-5 w-5"/>
                        <span className="hidden sm:inline">Add New Patient</span>
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="p-0">
                {/* List Header (Desktop only) */}
                <div className="hidden md:flex items-center p-4 bg-gray-50 dark:bg-gray-800/50">
                    <Typography variant="small" className="font-bold flex-[2] opacity-70">Patient Name</Typography>
                    <Typography variant="small" className="font-bold flex-1 opacity-70">Email</Typography>
                    <Typography variant="small" className="font-bold flex-1 opacity-70">Phone</Typography>
                    <Typography variant="small" className="font-bold flex-1 text-center opacity-70">Actions</Typography>
                </div>

                {/* Patients List */}
                <div>
                    {patients.length > 0 ? (
                        patients.map(patientProfile => (
                            <div key={patientProfile._id} className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                {/* Patient Info */}
                                <div className="flex items-center gap-3 mb-2 md:mb-0 flex-[2] w-full">
                                    <Avatar 
                                        src={patientProfile.user.image || `https://ui-avatars.com/api/?name=${patientProfile.user.name.replace(/\s/g, '+')}`}
                                        alt={patientProfile.user.name} 
                                        size="sm"
                                    />
                                    <Typography color="inherit" className="font-semibold">{patientProfile.user.name}</Typography>
                                </div>

                                {/* Email */}
                                <div className="mb-2 md:mb-0 flex-1 w-full">
                                    <Typography variant="small" className="md:hidden font-bold opacity-70">Email:</Typography>
                                    <Typography color="inherit" variant="small">{patientProfile.user.email}</Typography>
                                </div>
                                
                                {/* Phone */}
                                <div className="mb-2 md:mb-0 flex-1 w-full">
                                    <Typography variant="small" className="md:hidden font-bold opacity-70">Phone:</Typography>
                                    <Typography color="inherit" variant="small">{patientProfile.phone || 'N/A'}</Typography>
                                </div>

                                {/* Actions */}
                                <div className="flex-1 w-full flex justify-start md:justify-center">
                                    <Link href={`/dashboard/patients/${patientProfile.user._id}`}>
                                        <Button size="sm" variant="text" color="blue">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-10">
                            <Typography className="opacity-80">You have not added any patients yet.</Typography>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default MyPatientsPage;