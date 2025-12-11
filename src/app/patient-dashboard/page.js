// src/app/patient-dashboard/page.js
"use client";

import MedicineDetailsModal from '@/components/MedicineDetailsModal';
import PrescriptionsCard from '@/components/PrescriptionsCard';
import ReportSection from "@/components/ReportSection";
import PrescriptionGenerateSection from "@/components/PrescriptionGenerateSection";

import {
    Avatar,
    Card,
    CardBody,
    CardHeader,
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

    // modal & medicine detail states (shared)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

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

    // medicine detail fetch (shared)
    const handleViewMedicineDetails = async (medicationName) => {
        setIsFetchingDetails(true);
        setIsDetailsModalOpen(true);
        try {
            const res = await fetch(`/api/medicines/search?name=${encodeURIComponent(medicationName)}`);
            if (!res.ok) throw new Error("Medicine details not found.");
            const data = await res.json();
            setSelectedMedicine(data);
        } catch (error) {
            console.error(error);
            setSelectedMedicine({ brandName: medicationName, indications: 'Details not available.' });
        } finally {
            setIsFetchingDetails(false);
        }
    };
    const closeModal = () => setIsDetailsModalOpen(false);

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
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Your Vitals & Profile</Typography>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <li><strong>Age:</strong> {profile.age || 'N/A'}</li>
                            <li><strong>Height:</strong> {profile.height || 'N/A'}</li>
                            <li><strong>Weight:</strong> {profile.weight || 'N/A'}</li>
                            <li><strong>Blood Pressure:</strong> {profile.bloodPressure || 'N/A'}</li>
                            <li><strong>Blood Group:</strong> {profile.bloodGroup || 'N/A'}</li>
                            <li><strong>Phone:</strong> {profile.phone || 'N/A'}</li>
                            <li className="col-span-2 sm:col-span-3"><strong>Address:</strong> {profile.address || 'N/A'}</li>
                        </ul>
                    </CardBody>
                </Card>
                <PrescriptionsCard
                    prescriptions={prescriptions}
                    title="Your Prescriptions"
                    onDownloadPdf={handleDownloadPdf}
                    onViewMedicineDetails={handleViewMedicineDetails}
                    emptyText="No prescriptions yet."
                />
                {/* নতুন: file-based prescriptions (PDF/Image) */}
                    <PrescriptionGenerateSection
                    user={profile.user}
                    patient={profile}
                    pageType="patient"
                    />

                {/* Reports Card (keep your existing implementation) */}
                <ReportSection
                reports={profile.reports}
                isUploading={isUploadingReport}
                handleReportUpload={handleReportUpload}
                showGenerateButton={false}
                pageType="patient"
                />

                   {/* Doctor-generated medical reports (read-only, from MongoDB medical_reports) */}
                <ReportSection
                  pageType="doctor"
                  showGenerateButton={false}
                  user={profile.user}
                  patient={profile}
                />
                
            </div>

            <MedicineDetailsModal
                open={isDetailsModalOpen}
                onClose={closeModal}
                medicine={selectedMedicine}
                loading={isFetchingDetails}
            />
        </div>
    );
};

export default PatientDashboardPage;
