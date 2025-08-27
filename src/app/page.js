// src/app/page.js
import Link from 'next/link';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <main className={styles.mainContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Your Health, Our Priority</h1>
        <p className={styles.subtitle}>
          Book appointments with our expert doctors hassle-free.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/patient-dashboard" className={styles.primaryButton}>
            Book an Appointment
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            I am a Doctor
          </Link>
        </div>
      </div>
    </main>
  );
}