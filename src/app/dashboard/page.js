// src/app/dashboard/page.js
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from './Dashboard.module.scss';
import Link from "next/link";
import Image from "next/image";

// Stat Card কম্পোনেন্ট (একই ফাইলের ভেতরে রাখা হলো)
const StatCard = ({ title, value, icon }) => (
    <div className={styles.statCard}>
        <div className={styles.iconWrapper}>{icon}</div>
        <div className={styles.statInfo}>
            <p>{title}</p>
            <span>{value}</span>
        </div>
    </div>
);

const DoctorDashboardPage = () => {
    const { data: session } = useSession();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard/doctor');
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className={styles.loading}>Loading Dashboard...</p>;

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Welcome, Dr. {session?.user?.name?.split(' ')[0]}</h1>
                <p>Have a nice day at work</p>
            </header>

            <section className={styles.statsGrid}>
                <StatCard title="Today's Appointments" value={dashboardData?.stats?.todaysAppointmentsCount || 0} icon={"📅"} />
                <StatCard title="Total Patients" value={dashboardData?.stats?.totalPatientsCount || 0} icon={"👥"} />
            </section>

            <section className={styles.appointmentsSection}>
                <h2>Today&apos;s Appointments</h2>
                <div className={styles.appointmentList}>
                    {dashboardData?.todaysAppointments?.length > 0 ? (
                        dashboardData.todaysAppointments.map(app => (
                            <div key={app._id} className={styles.appointmentItem}>
                                <div className={styles.patientInfo}>
                                    <Image 
                                        src={app.patient?.image || `https://ui-avatars.com/api/?name=${app.patient?.name}`}
                                        alt={app.patient?.name}
                                        width={40}
                                        height={40}
                                        className={styles.patientAvatar}
                                    />
                                    <span>{app.patient?.name}</span>
                                </div>
                                <div className={styles.appointmentTime}>
                                    {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <Link href={`/dashboard/patients/${app.patient?._id}`} className={styles.viewProfileBtn}>
                                    View Profile
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noAppointments}>
                            <p>You have no appointments for today. ✨</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DoctorDashboardPage;