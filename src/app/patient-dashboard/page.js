// src/app/patient-dashboard/page.js
"use client";

import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, PencilIcon, PhotoIcon } from '@heroicons/react/24/solid';
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    IconButton,
    Input, List, ListItem,
    ListItemSuffix,
    Spinner,
    Typography
} from '@material-tailwind/react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

const PatientDashboardPage = () => {
    const { update } = useSession();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingReport, setIsUploadingReport] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
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
    
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

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

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner className="h-12 w-12" /></div>;
    if (!dashboardData) return <Typography className="text-center p-10">Could not load your profile data. Please try again later.</Typography>;

    const { profile, prescriptions } = dashboardData;

    return (
        <div className="flex flex-col gap-6">
            <Card className="w-full bg-light-card dark:bg-dark-card">
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <Avatar src={imagePreview || profile?.user?.image || `https://ui-avatars.com/api/?name=${profile?.user?.name.replace(/\s/g, '+')}`} alt={profile?.user?.name || 'User'} size="xxl" />
                        <div>
                            <Typography variant="h4" className="text-light-text-primary dark:text-dark-text-primary">Welcome, {profile?.user?.name}</Typography>
                            <Typography className="text-light-text-secondary dark:text-dark-text-secondary">{profile?.user?.email}</Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
                <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                         <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Your Vitals & Profile</Typography>
                            {!isEditing && <IconButton variant="text" onClick={() => setIsEditing(true)}><PencilIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/></IconButton>}
                        </div>
                    </CardHeader>
                    <CardBody>
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <Input crossOrigin={""} label="Name" name="name" value={formData.name} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                                <Input crossOrigin={""} type="file" label="Profile Picture" name="image" onChange={handleFileChange} accept="image/*" color="blue-gray" className="dark:text-white" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input crossOrigin={""} label="Age" name="age" value={formData.age} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                                    <Input crossOrigin={""} label="Height" name="height" value={formData.height} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                                    <Input crossOrigin={""} label="Weight" name="weight" value={formData.weight} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                                    <Input crossOrigin={""} label="Blood Pressure" name="bloodPressure" value={formData.bloodPressure} onChange={handleInputChange} color="blue-gray" className="dark:text-white" />
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <Button size="sm" variant="text" color="red" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button size="sm" color="green" type="submit" disabled={isSaving}>{isSaving ? <Spinner className="h-4 w-4" /> : 'Save'}</Button>
                                </div>
                            </form>
                        ) : (
                            <ul className="grid grid-cols-2 gap-4">
                                <li><strong>Age:</strong> {profile.age || 'N/A'}</li>
                                <li><strong>Height:</strong> {profile.height || 'N/A'}</li>
                                <li><strong>Weight:</strong> {profile.weight || 'N/A'}</li>
                                <li><strong>Blood Pressure:</strong> {profile.bloodPressure || 'N/A'}</li>
                            </ul>
                        )}
                    </CardBody>
                </Card>

                <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                             <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Your Prescriptions</Typography>
                        </div>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4 p-4">
                        {prescriptions && prescriptions.length > 0 ? prescriptions.slice().reverse().map(p => (
                            <Card key={p._id} className="p-4 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar src={p.doctorInfo.image || '/default-avatar.png'} alt={p.doctorInfo.name} size="sm" />
                                    <div>
                                        <Typography variant="small" className="font-bold text-light-text-primary dark:text-dark-text-primary">Dr. {p.doctorInfo.name}</Typography>
                                        <Typography variant="small" className="opacity-80 text-light-text-secondary dark:text-dark-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
                                    </div>
                                    <div className="ml-auto">
                                        <IconButton variant="text" onClick={() => handleDownloadPdf(p._id)}><ArrowDownTrayIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/></IconButton>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1 pl-4">
                                    {p.medications.map((med, index) => (
                                        med.medicationName && (
                                            <div key={index} className="flex flex-row items-start">
                                                <Typography variant="small" as="span" className="w-6 font-bold text-light-text-secondary dark:text-dark-text-secondary">{index + 1}.</Typography>
                                                <Typography variant="small" as="div" className="flex-1 text-light-text-primary dark:text-dark-text-primary">
                                                    <strong>{med.medicationName}</strong> - {med.dosage || 'N/A'}
                                                </Typography>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </Card>
                        )) : <Typography variant="small" className="text-center">No prescriptions yet.</Typography>}
                    </CardBody>
                </Card>

                <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Your Reports</Typography>

                            <div className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
                            <a href="https://hms-psi-three.vercel.app/" target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="filled" color="blue-gray">
                                    Generate Report
                                </Button>
                            </a>
                            <label 
                                htmlFor="report-upload" 
                                className={`cursor-pointer inline-block text-sm font-medium py-2 px-4 rounded-lg transition-colors 
                                ${isUploadingReport 
                                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-light-text-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary'}`}
                            >
                                {isUploadingReport ? 'Uploading...' : 'Upload New'}
                            </label>
                            <input 
                                type="file" 
                                id="report-upload" 
                                hidden 
                                onChange={handleReportUpload} 
                                disabled={isUploadingReport}
                                accept="image/*, application/pdf"
                            />
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <List>
                           {profile.reports && profile.reports.length > 0 ? profile.reports.slice().reverse().map((report, index) => (
                                <ListItem key={index} className="rounded-lg mb-2 bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Typography variant="small" className="font-bold opacity-70">{index + 1}.</Typography>
                                        {report.fileName.endsWith('.pdf') ? <DocumentTextIcon className="h-6 w-6 text-red-500" /> : <PhotoIcon className="h-6 w-6 text-blue-500" />}
                                    </div>
                                    <a href={report.url} target="_blank" rel="noopener noreferrer" title={report.fileName} className="flex-1 mx-4 truncate hover:underline text-light-text-primary dark:text-dark-text-primary">
                                        {report.fileName}
                                    </a>
                                    <ListItemSuffix>
                                        <a href={report.url} target="_blank" rel="noopener noreferrer">
                                            <IconButton variant="text"><EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/></IconButton>
                                        </a>
                                    </ListItemSuffix>
                                </ListItem>
                            )) : <Typography variant="small" className="p-4 text-center opacity-70">No reports uploaded.</Typography>}
                        </List>
                    </CardBody>
                </Card>
                
                
            </div>
        </div>
    );
};

export default PatientDashboardPage;