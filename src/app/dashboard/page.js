// src/app/dashboard/page.js
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './Dashboard.module.scss';

// Stat Card কম্পোনেন্ট (একই ফাইলের ভেতরে রাখা হলো)
const StatCard = ({ title, value, icon, link }) => {
    const cardContent = (
        <div className={styles.statCard}>
            <div className={styles.iconWrapper}>{icon}</div>
            <div className={styles.statInfo}>
                <p>{title}</p>
                {/* শুধুমাত্র value থাকলেই সেটি দেখানো হবে */}
                {value !== undefined && <span>{value}</span>}
            </div>
        </div>
    );

    // যদি লিঙ্ক থাকে, তাহলে কার্ডটিকে একটি clickable লিঙ্কে পরিণত করা হবে
    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                {cardContent}
            </a>
        );
    }

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
                <div>
                    <h2>Dashboard</h2>
                    <p className={styles.currentDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>
            <div className={styles.welcomeBanner}>
                <div className={styles.bannerText}>
                    <h2>Welcome, Dr. {session?.user?.name || 'User'}</h2>
                    <p>Have a nice day at work</p>
                </div>
            </div>

            <section className={styles.statsGrid}>
                <StatCard 
                    title="Today's Appointments" 
                    value={dashboardData?.stats?.todaysAppointmentsCount || 0} 
                    icon={"📅"} 
                />
                <StatCard 
                    title="Total Patients" 
                    value={dashboardData?.stats?.totalPatientsCount || 0} 
                    icon={"👥"} 
                />
                <StatCard 
                    title="Blood Bank & Donation" 
                    icon={"🩸"}
                    link="http://anirban.lovestoblog.com/"
                />
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