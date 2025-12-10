"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { 
    Card, CardHeader, CardBody, Typography, Button, 
    Input, Select, Option, Avatar, Spinner, Textarea
} from '@material-tailwind/react';

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const gender = ["Male", "Female"];

const PatientProfilePage = () => {
    // --- All state and logic are preserved and adapted ---
    const { data: session, update } = useSession();
    const [formData, setFormData] = useState({
        name: '', image: '', phone: '', age: '', gender: '',
        height: '', weight: '', bloodPressure: '',
        bloodGroup: '', address: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fetchData = useCallback(async () => {
        if (session) {
            setLoading(true);
            try {
                const res = await fetch('/api/profile/patient');
                if (!res.ok) throw new Error("Could not fetch profile data.");
                const data = await res.json();
                
                if (data.success && data.profile) {
                    setFormData({
                        name: data.profile.user?.name || '',
                        email: data.profile.user?.email || '', // Added email for display
                        image: data.profile.user?.image || '',
                        phone: data.profile.phone || '',
                        age: data.profile.age || '',
                        height: data.profile.height || '',
                        weight: data.profile.weight || '',
                        bloodPressure: data.profile.bloodPressure || '',
                        bloodGroup: data.profile.bloodGroup || '',
                        gender: data.profile.gender || '',
                        address: data.profile.address || '',
                    });
                }
            } catch (error) {
                console.error(error);
                setMessage('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                data.append('file', selectedFile);
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
            const profileDataToSave = { ...formData, image: imageUrl };
            const res = await fetch('/api/profile/patient', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileDataToSave),
            });
            if (!res.ok) throw new Error('Failed to update profile.');
            
            await update({ name: profileDataToSave.name, image: profileDataToSave.image });
            setMessage('Profile updated successfully!');
            fetchData();
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
                    <Typography variant="small" color="inherit" className="opacity-70">Keep your personal and health information up to date.</Typography>
                </div>
            </CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Left Column: Form Fields */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            <Input crossOrigin={""} label="Full Name" name="name" value={formData.name} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                            <Input crossOrigin={""} label="Email Address" name="email" value={formData.email} disabled color="blue-gray" />
                            <Input crossOrigin={""} label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                        </div>
                        {/* Right Column: Profile Picture */}
                        <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-light-bg dark:bg-dark-bg">
                            <Typography variant="small" className="font-bold">Profile Picture</Typography>
                            <Avatar src={imagePreview || formData.image || `https://ui-avatars.com/api/?name=${formData.name.replace(/\s/g, '+')}`} alt="Profile Preview" size="xxl" />
                            <label htmlFor="profile-picture-upload" className="cursor-pointer inline-block text-sm font-bold py-2 px-4 rounded-lg border border-blue-gray-500 hover:bg-blue-gray-50/50 transition-colors">
                                Change Picture
                            </label>
                            <input type="file" id="profile-picture-upload" name="image" hidden onChange={handleFileChange} accept="image/*" />
                        </div>
                    </div>

                    {/* Vitals and other info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Input crossOrigin={""} label="Age" name="age" value={formData.age} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                        <Input crossOrigin={""} label="Height" name="height" value={formData.height} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                        <Input crossOrigin={""} label="Weight" name="weight" value={formData.weight} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                        <Select label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={(v) => handleInputChange({ target: { name: 'bloodGroup', value: v } })} animate={{mount: {y: 0}, unmount: {y: 25}}} color="blue-gray" className="dark:text-white" menuProps={{className: "bg-light-card dark:bg-dark-card ..."}}>
                            {bloodGroups.map(group => <Option key={group} value={group}>{group}</Option>)}
                        </Select>
                        <Select label="Gender" name="gender" value={formData.gender} onChange={(v) => handleInputChange({ target: { name: 'gender', value: v } })} animate={{mount: {y: 0}, unmount: {y: 25}}} color="blue-gray" className="dark:text-white" menuProps={{className: "bg-light-card dark:bg-dark-card ..."}}>
                            {gender.map(group => <Option key={group} value={group}>{group}</Option>)}
                        </Select>
                    </div>
                    
                    <Input crossOrigin={""} label="Blood Pressure" name="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
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

export default PatientProfilePage;