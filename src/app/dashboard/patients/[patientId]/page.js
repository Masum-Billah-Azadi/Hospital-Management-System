// src/app/dashboard/patients/[patientId]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './PatientProfile.module.scss';

const PatientProfilePage = () => {
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const { patientId } = params;

    // এডিটিং এর জন্য নতুন State
    const [isEditingVitals, setIsEditingVitals] = useState(false);
    const [vitalsData, setVitalsData] = useState({ age: '', height: '', weight: '', bloodPressure: '' });
    const [showMedicationForm, setShowMedicationForm] = useState(false);
    const [newMedication, setNewMedication] = useState({ medicationName: '', dosage: '', notes: '' });

    useEffect(() => {
        if (patientId) {
            const fetchPatientProfile = async () => {
                try {
                    const res = await fetch(`/api/patients/${patientId}`);
                    if (!res.ok) throw new Error('Could not fetch patient profile.');
                    const data = await res.json();
                    setPatientData(data);
                    // Vitals state ইনিশিয়ালাইজ করা
                    setVitalsData({
                        age: data.age || '',
                        height: data.height || '',
                        weight: data.weight || '',
                        bloodPressure: data.bloodPressure || '',
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPatientProfile();
        }
    }, [patientId]);

    const handleVitalsChange = (e) => {
        const { name, value } = e.target;
        setVitalsData(prev => ({ ...prev, [name]: value }));
    };

    const handleVitalsSave = async () => {
        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vitalsData),
            });
            if (!res.ok) throw new Error('Failed to update vitals.');
            const updatedProfile = await res.json();
            
            // UI তে ডেটা আপডেট করা
            setPatientData(prev => ({ ...prev, ...updatedProfile.profile }));
            setIsEditingVitals(false); // এডিটিং মোড বন্ধ করা
        } catch (error) {
            console.error(error);
            alert('Error updating vitals.');
        }
    };

    const handleNewMedicationChange = (e) => {
        const { name, value } = e.target;
        setNewMedication(prev => ({ ...prev, [name]: value }));
    };

    const handleMedicationSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientProfileId: patientData._id,
                    ...newMedication
                }),
            });
            if (!res.ok) throw new Error('Failed to add prescription.');
            const { prescription } = await res.json();
            
            // UI তে নতুন প্রেসক্রিপশনটি তাৎক্ষণিকভাবে যোগ করা
            setPatientData(prev => ({
                ...prev,
                prescriptions: [prescription, ...prev.prescriptions]
            }));

            // ফর্ম রিসেট এবং বন্ধ করা
            setNewMedication({ medicationName: '', dosage: '', notes: '' });
            setShowMedicationForm(false);

        } catch (error) {
            console.error(error);
            alert('Error adding prescription.');
        }
    };


    if (loading) return <div>Loading patient profile...</div>;
    if (!patientData) return <div>Patient profile not found.</div>;

    const { user, prescriptions } = patientData;


    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <Image
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    width={120}
                    height={120}
                    className={styles.avatar}
                />
                <div className={styles.headerInfo}>
                    <h1>{user.name}</h1>
                    <p>{user.email}</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <h2>Vitals</h2>
                        {!isEditingVitals && <button onClick={() => setIsEditingVitals(true)} className={styles.editButton}>Edit</button>}
                    </div>

                    {isEditingVitals ? (
                        <div className={styles.editForm}>
                            <label>Age: <input name="age" value={vitalsData.age} onChange={handleVitalsChange} /></label>
                            <label>Height: <input name="height" value={vitalsData.height} onChange={handleVitalsChange} /></label>
                            <label>Weight: <input name="weight" value={vitalsData.weight} onChange={handleVitalsChange} /></label>
                            <label>Blood Pressure: <input name="bloodPressure" value={vitalsData.bloodPressure} onChange={handleVitalsChange} /></label>
                            <div className={styles.formActions}>
                                <button onClick={handleVitalsSave} className={styles.saveButton}>Save</button>
                                <button onClick={() => setIsEditingVitals(false)} className={styles.cancelButton}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <ul>
                            <li><strong>Age:</strong> {patientData.age || 'N/A'}</li>
                            <li><strong>Height:</strong> {patientData.height || 'N/A'}</li>
                            <li><strong>Weight:</strong> {patientData.weight || 'N/A'}</li>
                            <li><strong>Blood Pressure:</strong> {patientData.bloodPressure || 'N/A'}</li>
                        </ul>
                    )}
                </div>
                
                {/* --- Medications Card আপডেট করা হয়েছে --- */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <h2>Medications</h2>
                        {!showMedicationForm && <button onClick={() => setShowMedicationForm(true)} className={styles.editButton}>Add New</button>}
                    </div>

                    {showMedicationForm && (
                        <form onSubmit={handleMedicationSubmit} className={styles.medicationForm}>
                            <input name="medicationName" value={newMedication.medicationName} onChange={handleNewMedicationChange} placeholder="Medication Name" required />
                            <input name="dosage" value={newMedication.dosage} onChange={handleNewMedicationChange} placeholder="Dosage (e.g., 500mg, 1+0+1)" />
                            <textarea name="notes" value={newMedication.notes} onChange={handleNewMedicationChange} placeholder="Notes (optional)" rows="3"></textarea>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.saveButton}>Save</button>
                                <button type="button" onClick={() => setShowMedicationForm(false)} className={styles.cancelButton}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div className={styles.medicationList}>
                        {prescriptions && prescriptions.length > 0 ? (
                            prescriptions.map(p => (
                                <div key={p._id} className={styles.medicationItem}>
                                    <h4>{p.medicationName}</h4>
                                    <p><strong>Dosage:</strong> {p.dosage || 'N/A'}</p>
                                    {p.notes && <p><strong>Notes:</strong> {p.notes}</p>}
                                    <small>Prescribed on {new Date(p.createdAt).toLocaleDateString()}</small>
                                </div>
                            ))
                        ) : (
                            <p>No medications prescribed yet.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <h2>Reports</h2>
                    <p>No reports uploaded yet.</p>
                    {/* আমরা পরের ধাপে এখানে রিপোর্ট আপলোড করার ব্যবস্থা করব */}
                </div>
            </div>
        </div>
    );
};

export default PatientProfilePage;