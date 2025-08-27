// src/components/dashboard/ScheduleCalendar.js
import Image from 'next/image';
import styles from './ScheduleCalendar.module.scss';

// Dummy data for schedule events
const events = [
  { id: 1, title: 'Check Up', description: 'Routine health check-ups', startDay: 2, span: 2, color: '#4D44B5', patients: ['/avatars/avatar-1.jpg', '/avatars/avatar-2.jpg', '/avatars/avatar-3.jpg'] },
  { id: 2, title: 'Consultation online', description: 'Telemedicine consultation', startDay: 1, span: 1, color: '#5DC9A8', patients: ['/avatars/avatar-1.jpg'] },
  { id: 3, title: 'Surgery', description: 'Intestinal surgery', startDay: 5, span: 2, color: '#FB7D5B', patients: ['/avatars/avatar-2.jpg', '/avatars/avatar-3.jpg'] },
  { id: 4, title: 'Vaccine Injection', description: 'Annual flu vaccine', startDay: 4, span: 3, color: '#5DC9A8', patients: ['/avatars/avatar-1.jpg', '/avatars/avatar-2.jpg', '/avatars/avatar-3.jpg'] },
];

const weekDays = [
  { day: 'Mon', date: 25 }, { day: 'Tue', date: 26 }, { day: 'Wed', date: 27 },
  { day: 'Thu', date: 28 }, { day: 'Fri', date: 29 }, { day: 'Sat', date: 30 }, { day: 'Sun', date: 31 },
];

const ScheduleCalendar = () => {
  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button className={styles.navButton}>{'<'}</button>
        <h3>January 2021</h3>
        <button className={styles.navButton}>{'>'}</button>
      </div>
      <div className={styles.calendarGrid}>
        {/* Week Day Headers */}
        {weekDays.map(d => (
          <div key={d.day} className={styles.dayHeader}>
            <span>{d.day}</span>
            <span className={styles.dateNumber}>{d.date}</span>
          </div>
        ))}

        {/* Events */}
        {events.map(event => (
          <div
            key={event.id}
            className={styles.eventBar}
            style={{
              gridColumn: `${event.startDay} / span ${event.span}`,
              backgroundColor: event.color,
            }}
          >
            <div className={styles.eventInfo}>
              <h4>{event.title}</h4>
              <p>{event.description}</p>
            </div>
            <div className={styles.patientAvatars}>
              {event.patients.map((p, index) => (
                <Image key={index} src={p} alt="patient" width={24} height={24} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;