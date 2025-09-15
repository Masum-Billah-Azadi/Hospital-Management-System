// src/app/dashboard/patients/[patientId]/page.js
"use client";

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './PatientProfile.module.scss';

const PatientProfilePage = () => {
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const { patientId } = params;

    // Vitals এডিটিং এর জন্য State
    const [isEditingVitals, setIsEditingVitals] = useState(false);
    const [vitalsData, setVitalsData] = useState({ age: '', height: '', weight: '', bloodPressure: '' });
    
    // Medications ফর্ম দেখানো বা লুকানোর জন্য State
    const [showMedicationForm, setShowMedicationForm] = useState(false);

    // ডাইনামিক প্রেসক্রিপশন ফর্মের জন্য State
    const [medications, setMedications] = useState([{ medicationName: '', dosage: '', notes: '' }]);
    const [generalNotes, setGeneralNotes] = useState('');
    const [suggestedReports, setSuggestedReports] = useState('');

    // **নতুন:** রিপোর্ট আপলোডের জন্য State
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (patientId) {
            const fetchPatientProfile = async () => {
                try {
                    const res = await fetch(`/api/patients/${patientId}`);
                    if (!res.ok) throw new Error('Could not fetch patient profile.');
                    const data = await res.json();
                    setPatientData(data);
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

    const handleDownloadPdf = (prescriptionId) => {
        window.open(`/api/prescriptions/${prescriptionId}/pdf`, '_blank');
    };

    // Vitals পরিবর্তন ও সেভ করার ফাংশন (অপরিবর্তিত)
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
            setPatientData(prev => ({ ...prev, ...updatedProfile.profile }));
            setIsEditingVitals(false);
        } catch (error) {
            console.error(error);
            alert('Error updating vitals.');
        }
    };

    // **নতুন:** ডাইনামিক মেডিসিন ফিল্ড পরিবর্তনের জন্য হ্যান্ডলার
    const handleMedicationChange = (index, e) => {
        const { name, value } = e.target;
        const updatedMedications = [...medications];
        updatedMedications[index][name] = value;
        setMedications(updatedMedications);
    };

    const addMedicationField = () => {
        setMedications([...medications, { medicationName: '', dosage: '', notes: '' }]);
    };

    const removeMedicationField = (index) => {
        if (medications.length <= 1) return;
        const updatedMedications = medications.filter((_, i) => i !== index);
        setMedications(updatedMedications);
    };
    
    // **নতুন:** রিপোর্ট আপলোড হ্যান্ডলার
const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        // ধাপ ১: Cloudinary-তে ফাইল আপলোড
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        if (!uploadRes.ok) throw new Error('File upload failed.');
        
        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
            // ধাপ ২: নির্ভরযোগ্য PATCH রুটে রিপোর্ট ডেটা পাঠানো
            const saveToDbRes = await fetch(`/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reports: [{ // অ্যারে হিসেবে পাঠানো হচ্ছে
                        fileName: uploadData.fileName,
                        url: uploadData.url,
                    }]
                }),
            });

            if (!saveToDbRes.ok) throw new Error('Failed to save report to profile.');
            
            const data = await saveToDbRes.json();
            setPatientData(data.profile); // আপডেটেড প্রোফাইল দিয়ে UI আপডেট
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setIsUploading(false);
        e.target.value = null;
    }
};

// ... আপনার বাকি সব কোড অপরিবর্তিত থাকবে ...

    const handleMedicationSubmit = async (e) => {
        e.preventDefault();
        const reportsArray = suggestedReports.split(',').map(report => report.trim()).filter(report => report);

        try {
            const res = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientProfileId: patientData._id,
                    medications,
                    generalNotes,
                    suggestedReports: reportsArray,
                    reports: [], // এখন প্রেসক্রিপশনের সাথে রিপোর্ট পাঠানো হচ্ছে না
                }),
            });
            if (!res.ok) throw new Error('Failed to add prescription.');
            const { prescription } = await res.json();
            
            setPatientData(prev => ({
                ...prev,
                prescriptions: [prescription, ...(prev.prescriptions || [])]
            }));

            // ফর্ম রিসেট
            setMedications([{ medicationName: '', dosage: '', notes: '' }]);
            setGeneralNotes('');
            setSuggestedReports('');
            setShowMedicationForm(false);

        } catch (error) {
            console.error(error);
            alert('Error adding prescription.');
        }
    };

    if (loading) return <div>Loading patient profile...</div>;
    if (!patientData) return <div>Patient profile not found.</div>;

    const { user, prescriptions, reports } = patientData; // রোগীর ডেটা থেকে 'reports' নেওয়া হচ্ছে

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
                {/* Vitals Card (অপরিবর্তিত) */}
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
                
                {/* --- Medications Card (সম্পূর্ণ আপডেট করা হয়েছে) --- */}
                <div className={`${styles.card} ${styles.medicationsCard}`}>
                    <div className={styles.cardTitle}>
                        <h2>Prescriptions</h2>
                        {!showMedicationForm && <button onClick={() => setShowMedicationForm(true)} className={styles.editButton}>Add New Prescription</button>}
                    </div>

                    {/* **নতুন:** ডাইনামিক প্রেসক্রিপশন ফর্ম */}
                    {showMedicationForm && (
                        <form onSubmit={handleMedicationSubmit} className={styles.medicationForm}>
                            {medications.map((med, index) => (
                                <div key={index} className={styles.medicationInputGroup}>
                                    <input name="medicationName" value={med.medicationName} onChange={(e) => handleMedicationChange(index, e)} placeholder="Medication Name" required />
                                    <input name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} placeholder="Dosage (e.g., 500mg, 1+0+1)" />
                                    {medications.length > 1 && (
                                        <button type="button" onClick={() => removeMedicationField(index)} className={styles.removeButton}>Remove</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addMedicationField} className={styles.addButton}>+ Add More Medicine</button>
                            
                            <textarea name="generalNotes" value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} placeholder="General Notes..." rows="3"></textarea>
                            <textarea name="suggestedReports" value={suggestedReports} onChange={(e) => setSuggestedReports(e.target.value)} placeholder="Suggested Reports (comma separated, e.g., CBC, Urine R/E)" rows="2"></textarea>
                            
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.saveButton}>Save Prescription</button>
                                <button type="button" onClick={() => setShowMedicationForm(false)} className={styles.cancelButton}>Cancel</button>
                            </div>
                        </form>
                    )}

                    {/* **নতুন:** প্রেসক্রিপশন তালিকা দেখানোর UI */}
                    <div className={styles.prescriptionsList}>
                        {prescriptions && prescriptions.length > 0 ? (
                            prescriptions.map(p => (
                                <div key={p._id} className={styles.prescriptionItem}>
                                    <div className={styles.doctorInfo}>
                                        <Image src={p.doctorInfo.image || '/default-avatar.png'} alt={p.doctorInfo.name} width={40} height={40} className={styles.doctorAvatar} />
                                        <div>
                                            <strong>Dr. {p.doctorInfo.name}</strong>
                                            <small>Prescribed on {new Date(p.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <div className={styles.prescriptionDetails}>
                                        <ul>
                                            {p.medications.map((med, index) => (
                                                <li key={index}>
                                                    <span>{med.medicationName}</span>
                                                    <span>{med.dosage}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {p.generalNotes && <p className={styles.notes}><strong>Notes:</strong> {p.generalNotes}</p>}
                                        {p.suggestedReports && p.suggestedReports.length > 0 && <p className={styles.notes}><strong>Tests:</strong> {p.suggestedReports.join(', ')}</p>}
                                    </div>
                                    <button 
                                        onClick={() => handleDownloadPdf(p._id)} 
                                        className={styles.downloadButton}
                                        title="Download PDF"
                                    >
                                        Download PDF
                                    </button>
                                </div>
                            ))
                        ) : (
                            !showMedicationForm && <p>No medications prescribed yet.</p>
                        )}
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <h2>Reports</h2>
                        {/* একটি লেবেলকে বাটনের মতো করে দেখানো হচ্ছে */}
                        <label htmlFor="report-upload" className={styles.editButton}>
                            {isUploading ? 'Uploading...' : 'Upload New'}
                        </label>
                        <input 
                            type="file" 
                            id="report-upload" 
                            onChange={handleReportUpload} 
                            disabled={isUploading}
                            style={{ display: 'none' }} // আসল ইনপুটটি লুকানো থাকবে
                            accept="image/png, image/jpeg, image/jpg, application/pdf" // ফাইলের ধরন নির্দিষ্ট করা
                        />
                    </div>
                    
                    <div className={styles.reportsList}>
                        {/* patientData থেকে রিপোর্টগুলো দেখানো হচ্ছে */}
                        {(patientData.reports && patientData.reports.length > 0) ? (
                            <ul>
                                {patientData.reports.map((report, index) => (
                                    <li key={index}>
                                        <a href={report.url} target="_blank" rel="noopener noreferrer">
                                            {report.fileName}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No reports uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfilePage;