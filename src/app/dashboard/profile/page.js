// src/app/dashboard/profile/page.js
"use client";

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './Profile.module.scss';

const specialties = [
    "MEDICINE", "OBSTETRICS & GYNECOLOGY", "PAEDIATRIC MEDICINE",
    "GENERAL & LAPAROSCOPIC SURGERY", "ORTHOPEDICS", "CARDIOLOGY",
    "ENT", "NEURO MEDICINE", "RADIOLOGY & IMAGING", "ONCOLOGY"
];
const ProfilePage = () => {
    const { data: session, update } = useSession();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: '',
        phone: '',
        designation: '',
        address: ''
    });

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // <-- এই লাইনটি যোগ করা হয়েছে
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (session) {
            setLoading(true);
            fetch('/api/profile/doctor')
                .then(res => res.json())
                .then(data => {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        image: data.image || '',
                        phone: data.phone || '',
                        designation: data.designation || '',
                        address: data.address || ''
                    });
                    setLoading(false);
                });
        }
    }, [session]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const [imagePreview, setImagePreview] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    let imageUrl = formData.image;

    // যদি নতুন ফাইল সিলেক্ট করা হয়, তবে প্রথমে সেটি আপলোড করুন
    if (selectedFile) {
        try {
            const data = new FormData();
            data.set('file', selectedFile);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });
            if (!uploadRes.ok) throw new Error('Failed to upload image.');
            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
        } catch (error) {
            setMessage('Error uploading image: ' + error.message);
            setIsSaving(false);
            return;
        }
    }
    
    // এখন প্রোফাইল ডেটা ডাটাবেজে সেভ করুন
    try {
        const profileData = { ...formData, image: imageUrl };
        const res = await fetch('/api/profile/doctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!res.ok) throw new Error('Failed to update profile.');

        // ডাটাবেজ আপডেটের পর সেশন টোকেন আপডেট করুন
        await update({
            name: profileData.name,
            image: profileData.image
        });

        setMessage('Profile updated successfully!');
    } catch (error) {
        setMessage('Error: ' + error.message);
    } finally {
        setIsSaving(false);
    }
};

    if (loading) return <p>Loading profile...</p>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1>Edit Your Profile</h1>
                <p>Keep your professional information up to date.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.profileForm}>
                {/* **নতুন:** দুই-কলামের গ্রিড লেআউট */}
                <div className={styles.formGrid}>
                    {/* --- বাম কলাম: সাধারণ তথ্য --- */}
                    <div className={styles.leftColumn}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* --- ডান কলাম: প্রোফাইল ছবি --- */}
                    <div className={styles.rightColumn}>
                        <div className={styles.formGroup}>
                            <label>Profile Picture</label>
                            <div className={styles.profilePicUploader}>
                                <Image
                                    src={imagePreview || formData.image || `https://ui-avatars.com/api/?name=${formData.name}`}
                                    alt="Profile Preview"
                                    width={120}
                                    height={120}
                                    className={styles.avatarPreview}
                                />
                                <label htmlFor="image" className={styles.uploadButton}>
                                    Change Picture
                                </label>
                                <input type="file" name="image" id="image" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* --- গ্রিডের নিচে থাকা ফিল্ডগুলো --- */}
                <div className={styles.formGroup}>
                    <label htmlFor="designation">Designation</label>
                    <select name="designation" id="designation" value={formData.designation} onChange={handleInputChange}>
                        <option value="" disabled>Select a specialty</option>
                        {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="address">Address</label>
                    <textarea name="address" id="address" rows="4" value={formData.address} onChange={handleInputChange}></textarea>
                </div>
                
                {message && <p className={styles.message}>{message}</p>}
                
                <button type="submit" disabled={isSaving} className={styles.submitButton}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;