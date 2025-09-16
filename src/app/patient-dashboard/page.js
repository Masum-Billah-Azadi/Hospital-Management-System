//src\app\patient-dashboard\page.js
"use client";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import styles from './PatientDashboard.module.scss';

const PatientDashboardPage = () => {
    const { update } = useSession();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingReport, setIsUploadingReport] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/profile/patient');
            if (!res.ok) throw new Error("Could not fetch data.");
            const data = await res.json();
            
            if (data.success && data.profile) {
                setDashboardData(data);
                setFormData({
                    name: data.profile.user?.name || '',
                    image: data.profile.user?.image || '',
                    age: data.profile.age || '',
                    height: data.profile.height || '',
                    weight: data.profile.weight || '',
                    bloodPressure: data.profile.bloodPressure || '',
                });
            } else {
                setDashboardData(null); // কোনো ডেটা না থাকলে null সেট করা
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => { if (e.target.files) setSelectedFile(e.target.files[0]) };
    const handleDownloadPdf = (id) => window.open(`/api/prescriptions/${id}/pdf`, '_blank');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        let imageUrl = formData.image;

        if (selectedFile) {
            try {
                const data = new FormData();
                data.append('file', selectedFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: data });
                if (!uploadRes.ok) throw new Error('Failed to upload image.');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            } catch (error) {
                alert('Error uploading image: ' + error.message);
                setIsSaving(false);
                return;
            }
        }
        
        try {
            const res = await fetch('/api/profile/patient', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image: imageUrl }),
            });
            if (!res.ok) throw new Error('Failed to update profile.');
            
            await update({ name: formData.name, image: imageUrl });
            alert("Profile updated successfully!");
            setIsEditing(false);
            fetchData();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleReportUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingReport(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error('File upload to Cloudinary failed.');
            const uploadData = await uploadRes.json();
            
            if (uploadData.success) {
                const saveToDbRes = await fetch('/api/profile/patient', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        report: { fileName: uploadData.fileName, url: uploadData.url }
                    }),
                });
                if (!saveToDbRes.ok) throw new Error('Failed to save report to profile.');
                alert("Report uploaded successfully!");
                fetchData();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUploadingReport(false);
            e.target.value = null;
        }
    };

    if (loading) return <p>Loading your dashboard...</p>;
    if (!dashboardData) return <p>Could not load your profile data. Please try again later.</p>;

    const { profile, prescriptions } = dashboardData;

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                <Image
                    src={profile?.user?.image || `https://ui-avatars.com/api/?name=${profile?.user?.name || 'User'}`}
                    alt={profile?.user?.name || 'User'}
                    width={100}
                    height={100}
                    className={styles.avatar}
                />
                <div>
                    <h1>Welcome, {profile?.user?.name}</h1>
                    <p>{profile?.user?.email}</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <h2>Your Vitals & Profile</h2>
                        {!isEditing && <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit</button>}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className={styles.editForm}>
                            <label>Name: <input type="text" name="name" value={formData.name} onChange={handleInputChange} /></label>
                            <label>Profile Picture: <input type="file" onChange={handleFileChange} accept="image/*" /></label>
                            <label>Age: <input type="text" name="age" value={formData.age} onChange={handleInputChange} /></label>
                            <label>Height: <input type="text" name="height" value={formData.height} onChange={handleInputChange} /></label>
                            <label>Weight: <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} /></label>
                            <label>Blood Pressure: <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} /></label>
                            
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.downloadButton} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                                <button type="button" onClick={() => { setIsEditing(false); setSelectedFile(null); }} className={styles.editButton}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <ul className={styles.vitalsList}>
                            <li><strong>Age:</strong>{profile.age || 'N/A'}</li>
                            <li><strong>Height:</strong>{profile.height || 'N/A'}</li>
                            <li><strong>Weight:</strong>{profile.weight || 'N/A'}</li>
                            <li><strong>Blood Pressure:</strong>{profile.bloodPressure || 'N/A'}</li>
                        </ul>
                    )}
                </div>

                <div className={`${styles.card} ${styles.fullWidthCard}`}>
                    <div className={styles.cardTitle}><h2>Your Prescriptions</h2></div>
                    <div className={styles.prescriptionsList}>
                        {prescriptions && prescriptions.length > 0 ? (
                            prescriptions.map(p => (
                                <div key={p._id} className={styles.prescriptionItem}>
                                    <div className={styles.itemHeader}>
                                        <div className={styles.doctorInfo}>
                                            <Image src={p.doctorInfo.image || '/default-avatar.png'} alt={p.doctorInfo.name} width={40} height={40} />
                                            <div>
                                                <strong>Dr. {p.doctorInfo.name}</strong>
                                                <small>Prescribed on {new Date(p.createdAt).toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDownloadPdf(p._id)} className={styles.downloadButton}>Download PDF</button>
                                    </div>
                                    <ul className={styles.medicationList}>
                                        {p.medications.map((med, index) => (
                                            <li key={index}><strong>{med.medicationName}</strong> - {med.dosage}</li>
                                        ))}
                                    </ul>
                                    {p.generalNotes && <p><small><strong>Notes:</strong> {p.generalNotes}</small></p>}
                                </div>
                            ))
                        ) : (
                            <p>You have no prescriptions yet.</p>
                        )}
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        <h2>Your Reports</h2>
                        <label htmlFor="report-upload" className={styles.editButton}>
                            {isUploadingReport ? 'Uploading...' : 'Upload New Report'}
                        </label>
                        <input type="file" id="report-upload" onChange={handleReportUpload} disabled={isUploadingReport} style={{ display: 'none' }} accept="image/*, application/pdf" />
                    </div>
                    <ul className={styles.vitalsList}>
                        {(profile.reports && profile.reports.length > 0) ? (
                            profile.reports.map((report, index) => (
                                <li key={index}><a href={report.url} target="_blank" rel="noopener noreferrer">{report.fileName}</a></li>
                            ))
                        ) : (
                            <li>No reports uploaded yet.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboardPage;