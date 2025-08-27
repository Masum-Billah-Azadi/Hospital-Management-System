// src/app/dashboard/page.js
import StatsCard from '@/components/dashboard/StatsCard';
import ScheduleCalendar from '@/components/dashboard/ScheduleCalendar'; // ১. ইম্পোর্ট করো
import styles from './Dashboard.module.scss';

const DashboardPage = () => {
    // Dummy data for stats cards
    const stats = [
        { title: 'Patient', value: 1032, icon: '👥', color: '#4D44B5' },
        { title: 'Consultation', value: 207, icon: '💬', color: '#4D44B5' },
        { title: 'Inject', value: 128, icon: '💉', color: '#FB7D5B' },
        { title: 'Surgery', value: 48, icon: '🏥', color: '#5DC9A8' },
    ];

    return (
        <>
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>
            <ScheduleCalendar /> {/* ২. এখানে কম্পোনেন্টটি যোগ করো */}
        </>
    );
};

export default DashboardPage;