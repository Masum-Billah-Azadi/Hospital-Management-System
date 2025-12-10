// src/components/dashboard/RightSidebar.js
"use client";
import { Avatar, Card, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const RightSidebar = () => {
    const { data: session } = useSession();
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [recentPatients, setRecentPatients] = useState([]);

    useEffect(() => {
        if (session) {
            const fetchDashboardData = async () => {
                try {
                    const res = await fetch('/api/dashboard/doctor');
                    if (res.ok) {
                        const data = await res.json();
                        setDoctorProfile(data.doctorProfile);
                        setRecentPatients(data.recentPatients || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard data for sidebar", error);
                }
            };
            fetchDashboardData();
        }
    }, [session]);

    return (
        <aside className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col gap-4">
            {/* My Profile Card */}
            <Card className="p-4 shadow-xl bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <Typography variant="h6" className="mb-2">My Profile</Typography>
                <div className="flex flex-col items-center text-center gap-2">
                    <Avatar src={session?.user?.image || `...`} alt="Profile" size="xl" />
                    <Typography variant="h6">Dr. {session?.user?.name}</Typography>
                    <Typography variant="small" className="opacity-80">{doctorProfile?.designation || 'Specialty'}</Typography>
                </div>
            </Card>

            {/* Last Patient Card */}
            <Card className="flex-1 p-4 shadow-xl bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6">Last Patients</Typography>
                    <Link href="/dashboard/patients">
                        <Typography variant="small" className="text-primary font-bold">View All</Typography>
                    </Link>
                </div>
                <List className="p-0">
                    {recentPatients.length > 0 ? recentPatients.slice(0, 3).map(patient => ( // Show only 3 recent patients
                        <ListItem key={patient._id} className="text-light-text-primary dark:text-dark-text-primary">
                            <ListItemPrefix>
                                <Avatar src={patient.user?.image || `...`} alt={patient.user?.name} size="sm" />
                            </ListItemPrefix>
                            <div>
                                <Typography variant="small" className="font-bold">{patient.user?.name}</Typography>
                                <Typography variant="small" className="opacity-80">Last visit: {new Date(patient.updatedAt).toLocaleDateString()}</Typography>
                            </div>
                        </ListItem>
                    )) : (
                        <Typography variant="small" className="text-center p-4 opacity-80">No recent patients.</Typography>
                    )}
                </List>
            </Card>
             {/* PatientChart could go here if needed */}
        </aside>
    );
};

export default RightSidebar;