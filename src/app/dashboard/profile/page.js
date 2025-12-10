// src/app/dashboard/profile/page.js
"use client";

import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Option,
    Select,
    Spinner,
    Textarea,
    Typography
} from '@material-tailwind/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const specialties = [
    "MEDICINE", "OBSTETRICS & GYNECOLOGY", "PAEDIATRIC MEDICINE",
    "GENERAL & LAPAROSCOPIC SURGERY", "ORTHOPEDICS", "CARDIOLOGY",
    "ENT", "NEURO MEDICINE", "RADIOLOGY & IMAGING", "ONCOLOGY"
];

const ProfilePage = () => {
    // --- আপনার পুরোনো সব state এবং logic অপরিবর্তিত রাখা হয়েছে ---
    const { data: session, update } = useSession();
    const [formData, setFormData] = useState({ name: '', email: '', image: '', phone: '', designation: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (session) {
            setLoading(true);
            fetch('/api/profile/doctor')
                .then(res => res.json())
                .then(data => {
                    setFormData({
                        name: data.name || '', email: data.email || '', image: data.image || '',
                        phone: data.phone || '', designation: data.designation || '', address: data.address || ''
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

        if (selectedFile) {
            try {
                const data = new FormData();
                data.set('file', selectedFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: data });
                if (!uploadRes.ok) throw new Error('Failed to upload image.');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            } catch (error) {
                setMessage('Error uploading image: ' + error.message);
                setIsSaving(false);
                return;
            }
        }
        
        try {
            const profileData = { ...formData, image: imageUrl };
            const res = await fetch('/api/profile/doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            if (!res.ok) throw new Error('Failed to update profile.');
            await update({ name: profileData.name, image: profileData.image });
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner className="h-12 w-12" /></div>;

    return (
        <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
            <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-light-text-primary dark:text-dark-text-primary">
                    <Typography variant="h5" color="inherit">Edit Your Profile</Typography>
                    <Typography variant="small" color="inherit" className="opacity-70">Keep your professional information up to date.</Typography>
                </div>
            </CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Form Fields */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            <Input crossOrigin={""} label="Full Name" name="name" value={formData.name} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                            <Input crossOrigin={""} label="Email Address" name="email" value={formData.email} disabled color="blue-gray" />
                            <Input crossOrigin={""} label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                        </div>
                        {/* Right Column: Profile Picture */}
                        <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-light-bg dark:bg-dark-bg">
                            <Typography variant="small" className="font-bold">Profile Picture</Typography>
                            <Avatar src={imagePreview || formData.image || `...`} alt="Profile Preview" size="xxl" />
                            <label htmlFor="profile-picture-upload"
                                className="cursor-pointer inline-block text-sm font-bold py-2 px-4 rounded-lg border text-light-text-primary border-blue-gray-500 dark:text-dark-text-primary  hover:bg-blue-gray-30 transition-colors"
                            >
                                Change Picture
                            </label>
                            <input 
                                type="file" 
                                id="profile-picture-upload"
                                name="image" 
                                hidden 
                                onChange={handleFileChange} 
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Fields below the grid */}
                    <Select 
                        label="Select Designation" 
                        name="designation" 
                        value={formData.designation} 
                        onChange={(value) => handleInputChange({ target: { name: 'designation', value } })}
                        className="dark:text-white"
                        menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}
                    >
                        {specialties.map(specialty => (
                            <Option key={specialty} value={specialty}>{specialty}</Option>
                        ))}
                    </Select>
                    
                    <Textarea label="Address" name="address" value={formData.address} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />

                    {message && <Typography color={message.startsWith('Error') ? 'red' : 'green'} className="text-center">{message}</Typography>}
                    
                    <Button type="submit" color="blue" fullWidth disabled={isSaving}>
                        {isSaving ? <Spinner className="h-4 w-4 mx-auto" /> : 'Save Changes'}
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
};

export default ProfilePage;