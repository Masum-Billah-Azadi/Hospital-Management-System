// src/app/dashboard/page.js
"use client";
import { CalendarDaysIcon, PlusIcon, UsersIcon } from "@heroicons/react/24/solid";
import { Avatar, Button, Card, Spinner, Typography } from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Stat Card Component
const StatCard = ({ title, value, icon, link }) => {
    const cardContent = (
      // পরিবর্তন: এখানে h-full ক্লাসটি যোগ করা হয়েছে
      <Card className="p-4 shadow-md bg-light-card dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-full">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-full">{icon}</div>
          <div>
            <Typography className="text-light-text-secondary dark:text-dark-text-secondary">{title}</Typography>
            {/* পরিবর্তন: value না থাকলেও একটি অদৃশ্য স্পেস রাখা হয়েছে */}
            <Typography variant="h4" className="text-light-text-primary dark:text-dark-text-primary">
              {value !== undefined ? value : <>&nbsp;</>}
            </Typography>
          </div>
        </div>
      </Card>
    );
    if (link) return <a href={link} target="_blank" rel="noopener noreferrer">{cardContent}</a>;
    return cardContent;
};

const DoctorDashboardPage = () => {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/doctor');
                if (res.ok) setDashboardData(await res.json());
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner className="h-12 w-12" /></div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Header and Welcome Banner */}
            <header className="flex justify-between items-center">
                <div>
                    <Typography variant="h4" className="text-light-text-primary dark:text-dark-text-primary">Dashboard</Typography>
                    <Typography className="text-light-text-secondary dark:text-dark-text-secondary">{new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</Typography>
                </div>
                <Button color="blue" className="hidden md:flex items-center gap-2"><PlusIcon className="h-5 w-5"/> Add Patient</Button>
            </header>

            <Card className="p-6 bg-primary text-white">
                <Typography variant="h5">Welcome, Dr. {session?.user?.name || 'User'}!</Typography>
                <Typography>Have a nice day at work</Typography>
            </Card>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                    title="Today's Appointments" 
                    value={dashboardData?.stats?.todaysAppointmentsCount || 0} 
                    icon={<CalendarDaysIcon className="h-6 w-6 text-primary"/>} 
                />
                <StatCard 
                    title="Total Patients" 
                    value={dashboardData?.stats?.totalPatientsCount || 0} 
                    icon={<UsersIcon className="h-6 w-6 text-primary"/>} 
                />
                <StatCard 
                    title="Blood Bank & Donation" 
                    icon={<span className="text-2xl">🩸</span>} // Emoji can work too
                    link="http://anirban.lovestoblog.com/"
                />
            </section>

            {/* Appointments Section */}
            <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <Typography variant="h6" className="p-4 border-b border-gray-200 dark:border-gray-700">Today&apos;s Appointments</Typography>
                <div className="p-4">
                    {dashboardData?.todaysAppointments?.length > 0 ? (
                        dashboardData.todaysAppointments.map(app => (
                            <div key={app._id} className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar src={app.patient?.image || `...`} alt={app.patient?.name} />
                                    <span>{app.patient?.name}</span>
                                </div>
                                <span>{app.scheduledTime || new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <Link href={`/dashboard/patients/${app.patient?._id}`}>
                                    <Button size="sm" variant="text" color="blue">View Profile</Button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <Typography className="opacity-80">You have no appointments for today. ✨</Typography>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DoctorDashboardPage;