// src/app/dashboard/profile/page.js
"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './Profile.module.scss';

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

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
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
            <h1>Edit Your Profile</h1>
            <form onSubmit={handleSubmit} className={styles.profileForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email} disabled />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="image">Profile Picture</label>
                    <input type="file" name="image" id="image" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg"/>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="designation">Designation</label>
                    <input type="text" name="designation" id="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g., Cardiologist"/>
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