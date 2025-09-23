"use client";

import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, PencilIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/solid';
import {
    Avatar, Button,
    Card, CardBody, CardHeader,
    IconButton,
    Input,
    List, ListItem, ListItemSuffix, Spinner,
    Textarea,
    Typography
} from '@material-tailwind/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react'; // useCallback is imported

const PatientProfilePage = () => {
    // States for data, loading, and forms
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const { patientId } = params;
    const [isEditingVitals, setIsEditingVitals] = useState(false);
    const [vitalsData, setVitalsData] = useState({ age: '', height: '', weight: '', bloodPressure: '' });
    const [showMedicationForm, setShowMedicationForm] = useState(false);
    const [medications, setMedications] = useState([{ medicationName: '', dosage: '', notes: '' }]);
    const [generalNotes, setGeneralNotes] = useState('');
    const [suggestedReports, setSuggestedReports] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // FIX: Wrapped in useCallback to resolve ESLint warning
    const fetchPatientProfile = useCallback(async () => {
        setLoading(true);
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
    }, [patientId]);

    useEffect(() => {
        if (patientId) {
            fetchPatientProfile();
        }
    }, [patientId, fetchPatientProfile]); // fetchPatientProfile is now a dependency

    // Handler for saving vitals
    const handleVitalsSave = async () => {
        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vitalsData),
            });
            if (!res.ok) throw new Error('Failed to update vitals.');
            const updatedData = await res.json();
            setPatientData(updatedData);
            setIsEditingVitals(false);
            alert("Vitals updated successfully!");
        } catch (error) {
            console.error(error);
            alert('Error updating vitals.');
        }
    };

    // Handlers for dynamic prescription form
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
    
    // Handler for submitting a new prescription
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
                }),
            });
            if (!res.ok) throw new Error('Failed to add prescription.');
            const { prescription } = await res.json();
            setPatientData(prev => ({
                ...prev,
                prescriptions: [prescription, ...(prev.prescriptions || [])]
            }));
            // Reset form
            setMedications([{ medicationName: '', dosage: '', notes: '' }]);
            setGeneralNotes('');
            setSuggestedReports('');
            setShowMedicationForm(false);
        } catch (error) {
            console.error(error);
            alert('Error adding prescription.');
        }
    };
    
    // Handler for uploading reports
    const handleReportUploadByDoctor = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error('File upload failed.');
            const uploadData = await uploadRes.json();
            
            if (uploadData.success) {
                const saveToDbRes = await fetch(`/api/patients/${patientId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        report: { fileName: uploadData.fileName, url: uploadData.url }
                    }),
                });
                if (!saveToDbRes.ok) throw new Error('Failed to save report.');
                
                const updateData = await saveToDbRes.json();
                setPatientData(updateData);
                alert("Report added successfully!");
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset file input
        }
    };

    // Handler for downloading prescription PDF
    const handleDownloadPdf = (prescriptionId) => {
        window.open(`/api/prescriptions/${prescriptionId}/pdf`, '_blank');
    };

    const handleVitalsChange = (e) => {
        const { name, value } = e.target;
        setVitalsData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner className="h-16 w-16" /></div>;
    if (!patientData) return <Typography>Patient profile not found.</Typography>;

    const { user, prescriptions, reports } = patientData;

    return (
        <div className="flex flex-col gap-6">
            {/* --- Patient Header Card --- */}
            <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <Avatar src={user.image || `https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}`} alt={user.name} size="xxl" />
                        <div>
                            <Typography variant="h4" color="inherit">{user.name}</Typography>
                            <Typography color="inherit" className="opacity-80">{user.email}</Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* --- All cards are now in a single vertical column --- */}
            {/* Vitals Card */}
            <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Vitals</Typography>
                        {!isEditingVitals && <IconButton variant="text" onClick={() => setIsEditingVitals(true)}><PencilIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/></IconButton>}
                    </div>
                </CardHeader>
                <CardBody>
                    {isEditingVitals ? (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input crossOrigin={""} label="Age" name="age" value={vitalsData.age} onChange={handleVitalsChange} color="blue-gray" className="dark:text-white"/>
                                <Input crossOrigin={""} label="Height" name="height" value={vitalsData.height} onChange={handleVitalsChange} color="blue-gray" className="dark:text-white"/>
                                <Input crossOrigin={""} label="Weight" name="weight" value={vitalsData.weight} onChange={handleVitalsChange} color="blue-gray" className="dark:text-white"/>
                                <Input crossOrigin={""} label="Blood Pressure" name="bloodPressure" value={vitalsData.bloodPressure} onChange={handleVitalsChange} color="blue-gray" className="dark:text-white"/>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="text" color="red" onClick={() => setIsEditingVitals(false)}>Cancel</Button>
                                <Button size="sm" color="green" onClick={handleVitalsSave}>Save</Button>
                            </div>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <li><strong>Age:</strong> {patientData.age || 'N/A'}</li>
                            <li><strong>Height:</strong> {patientData.height || 'N/A'}</li>
                            <li><strong>Weight:</strong> {patientData.weight || 'N/A'}</li>
                            <li><strong>Blood Pressure:</strong> {patientData.bloodPressure || 'N/A'}</li>
                        </ul>
                    )}
                </CardBody>
            </Card>

            {/* Add Prescription Card */}
            <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Add New Prescription</Typography>
                        {!showMedicationForm && <Button size="sm" onClick={() => setShowMedicationForm(true)}>Create</Button>}
                    </div>
                </CardHeader>
                {showMedicationForm && (
                    <CardBody>
                        <form onSubmit={handleMedicationSubmit} className="flex flex-col gap-4">
                            {medications.map((med, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                                    <Input crossOrigin={""} name="medicationName" value={med.medicationName} onChange={(e) => handleMedicationChange(index, e)} label="Medication Name" required color="blue-gray" className="dark:text-white"/>
                                    <Input crossOrigin={""} name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} label="Dosage" color="blue-gray" className="dark:text-white"/>
                                    {medications.length > 1 && <IconButton color="red" variant="text" onClick={() => removeMedicationField(index)}><TrashIcon className="h-5 w-5" /></IconButton>}
                                </div>
                            ))}
                            <Button size="sm" variant="outlined" onClick={addMedicationField} className="self-start">+ Add More</Button>
                            <Textarea label="General Notes..." name="generalNotes" value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} color="blue-gray" className="dark:text-white"/>
                            <Textarea label="Suggested Reports (comma separated)..." name="suggestedReports" value={suggestedReports} onChange={(e) => setSuggestedReports(e.target.value)} color="blue-gray" className="dark:text-white"/>
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="text" color="red" onClick={() => setShowMedicationForm(false)}>Cancel</Button>
                                <Button size="sm" color="green" type="submit">Save Prescription</Button>
                            </div>
                        </form>
                    </CardBody>
                )}
            </Card>

            {/* Prescription History Card */}
                <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Prescription History</Typography>
                        </div>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        {prescriptions && prescriptions.length > 0 ? (
                            prescriptions.map(p => (
                                <Card key={p._id} className="p-4 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar src={p.doctorInfo.image || '/default-avatar.png'} alt={p.doctorInfo.name} size="sm" />
                                        <div>
                                            {/* পরিবর্তন: থিম-সচেতন টেক্সটের রঙ যোগ করা হয়েছে */}
                                            <Typography variant="small" className="font-bold text-light-text-primary dark:text-dark-text-primary">
                                                Dr. {p.doctorInfo.name}
                                            </Typography>
                                            {/* পরিবর্তন: থিম-সচেতন টেক্সটের রঙ যোগ করা হয়েছে */}
                                            <Typography variant="small" className="opacity-80 text-light-text-secondary dark:text-dark-text-secondary">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                        <div className="ml-auto">
                                            <IconButton variant="text" onClick={() => handleDownloadPdf(p._id)}><ArrowDownTrayIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/></IconButton>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-1 pl-4">
                                        {p.medications.map((med, index) => (
                                            med.medicationName && (
                                                <div key={index} className="flex flex-row items-start">
                                                    <Typography variant="small" as="span" className="w-6 font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                                        {index + 1}.
                                                    </Typography>
                                                    <Typography variant="small" as="div" className="flex-1 text-light-text-primary dark:text-dark-text-primary">
                                                        <strong>{med.medicationName}</strong> - {med.dosage || 'N/A'}
                                                    </Typography>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    
                                    {/* পরিবর্তন: থিম-সচেতন টেক্সটের রঙ যোগ করা হয়েছে */}
                                    {p.generalNotes && <Typography variant="small" className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-light-text-primary dark:text-dark-text-primary"><strong>Notes:</strong> {p.generalNotes}</Typography>}
                                    {p.suggestedReports && p.suggestedReports.length > 0 && <Typography variant="small" className="mt-2 text-light-text-primary dark:text-dark-text-primary"><strong>Tests:</strong> {p.suggestedReports.join(', ')}</Typography>}
                                </Card>
                            ))
                        ) : (<Typography variant="small" className="opacity-80 text-center p-4">No prescriptions found.</Typography>)}
                    </CardBody>
                </Card>

            {/* Reports Card */}
                <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Medical Reports</Typography>
                            
                            {/* ===== পরিবর্তন শুরু ===== */}
                            <label htmlFor="report-upload-doctor" 
                                className={`cursor-pointer inline-block text-sm font-bold py-2 px-4 rounded-lg border transition-colors 
                                ${isUploading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-transparent border-blue-gray-500 text-blue-gray-500 hover:bg-blue-gray-50'}`}
                            >
                                {isUploading ? 'Uploading...' : 'Upload New'}
                            </label>
                            <input 
                                type="file" 
                                id="report-upload-doctor"
                                hidden 
                                onChange={handleReportUploadByDoctor} 
                                disabled={isUploading}
                                accept="image/*, application/pdf" 
                            />
                            
                        </div>
                    </CardHeader>
                    <CardBody>
                        <List>
                            {(reports && reports.length > 0) ? (
                                // পরিবর্তন ২: .slice().reverse() দিয়ে লিস্টটি উল্টো করে দেখানো হচ্ছে
                                reports.slice().reverse().map((report, index) => (
                                    <ListItem 
                                        key={index} 
                                        // পরিবর্তন ৪: হালকা ব্যাকগ্রাউন্ড এবং অন্যান্য স্টাইল যোগ করা হয়েছে
                                        className="text-light-text-primary dark:text-dark-text-primary rounded-lg mb-2 bg-light-bg dark:bg-dark-bg"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* পরিবর্তন ১: সিরিয়াল নম্বর */}
                                            <Typography variant="small" className="font-bold opacity-70">
                                                {index + 1}.
                                            </Typography>
                                            {/* পরিবর্তন ১: ফাইলের ধরন অনুযায়ী আইকন */}
                                            {report.fileName.endsWith('.pdf') ? <DocumentTextIcon className="h-6 w-6 text-red-500" /> : <PhotoIcon className="h-6 w-6 text-blue-500" />}
                                        </div>
                                        <a 
                                            href={report.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title={report.fileName} 
                                            className="hover:underline flex-1 mx-4 truncate"
                                        >
                                            {report.fileName}
                                        </a>
                                        <ListItemSuffix>
                                            {/* পরিবর্তন ৩: চোখের আইকন এবং download অ্যাট্রিবিউট সরানো হয়েছে */}
                                            <a href={report.url} target="_blank" rel="noopener noreferrer">
                                                <IconButton variant="text">
                                                    <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/>
                                                </IconButton>
                                            </a>
                                        </ListItemSuffix>
                                    </ListItem>
                                ))
                            ) : (<Typography variant="small" className="opacity-80">No reports uploaded.</Typography>)}
                        </List>
                    </CardBody>
            </Card>
            
        </div>
    );
};

export default PatientProfilePage;