// src/app/dashboard/page.js
import StatsCard from '@/components/dashboard/StatsCard';
import styles from './Dashboard.module.scss';

const DashboardPage = () => {
    // Dummy data for now
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
                    <StatsCard 
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
            </div>

            {/* Other dashboard sections will go here */}
        </>
    );
};

export default DashboardPage;