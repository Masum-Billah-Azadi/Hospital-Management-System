// src/components/dashboard/StatsCard.js
import styles from './StatsCard.module.scss';

const StatsCard = ({ title, value, icon, color }) => {
    return (
        <div className={styles.card}>
            <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
                <span>{icon}</span>
            </div>
            <div className={styles.cardInfo}>
                <p>{title}</p>
                <h3>{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;