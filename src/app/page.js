// src/app/page.js
import styles from './Home.module.scss';

export default function Home() {
  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>Welcome to the Hospital Management System</h1>
      <p className={styles.subtitle}>Let&#39;s build this together!</p>
      <button className={styles.appointmentButton}>Book an Appointment</button>
    </main>
  );
}