"use client";

import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, PencilIcon, PhotoIcon,XMarkIcon } from '@heroicons/react/24/solid';
import {
    Avatar, Button,
    Card, CardBody, CardHeader,
    IconButton,
    Input,
    List, ListItem, ListItemSuffix,
    Option,
    Select,
    Spinner,
    Textarea,
    Typography, 
    Dialog, DialogHeader, DialogBody, DialogFooter
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
    // পরিবর্তন: Medication state-এ নতুন ফিল্ড যোগ করা হয়েছে
    const [medications, setMedications] = useState([
        { medicationName: '', dosage: '', frequency: '', instruction: '' }
    ]);
    const [generalNotes, setGeneralNotes] = useState('');
    const [suggestedReports, setSuggestedReports] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // ===== New states for the suggestion feature =====
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
     const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);



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

    // ===== নতুন useEffect যোগ করা হয়েছে =====
    useEffect(() => {
        if (searchTerm.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsFetchingSuggestions(true);
        const handler = setTimeout(() => {
            fetch(`/api/medicines/suggest?q=${searchTerm}`) // 'disease' এর পরিবর্তে 'q'
                .then(res => res.json())
                .then(data => {
                    setSuggestions(data);
                    setIsFetchingSuggestions(false);
                });
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // ===== নতুন handler ফাংশন যোগ করা হয়েছে =====
    const handleSuggestionClick = (medicine) => {
        const newMedications = medications.filter(med => med.medicationName);
        setMedications([
            ...newMedications,
            { medicationName: medicine.brandName, dosage: medicine.strength, frequency: '', instruction: '' }
        ]);
        setSuggestions([]);
        setSearchTerm('');
    };
    const handleViewDetails = (medicine, e) => {
        e.stopPropagation(); // এটি ListItem-এর onClick ট্রিগার হওয়া থেকে বিরত রাখে
        setSelectedMedicine(medicine);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => setIsDetailsModalOpen(false);
    

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

    // পরিবর্তন: handleMedicationChange ফাংশনটি Select এবং Input উভয়ের জন্য আপডেট করা হয়েছে
    const handleMedicationChange = (index, eventOrValue, fieldName) => {
        const updatedMedications = [...medications];
        if (fieldName) {
            updatedMedications[index][fieldName] = eventOrValue;
        } else {
            const { name, value } = eventOrValue.target;
            updatedMedications[index][name] = value;
        }
        setMedications(updatedMedications);
    };

    const addMedicationField = () => {
        setMedications([...medications, { medicationName: '', dosage: '', frequency: '', instruction: '' }]);
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


            <div className="flex flex-col gap-6">
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
                            {/* নতুন Diagnosis ইনপুট ফিল্ড */}
                            <div className="relative">
                                <Input 
                                    crossOrigin={""} 
                                    label="Search by Disease, Brand or Generic Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    color="blue-gray" className="dark:text-white"
                                />
                                {(isFetchingSuggestions || suggestions.length > 0) && (
                                    <Card className="absolute z-10 w-full mt-1 ...">
                                        <List>
                                            {isFetchingSuggestions ? ( <ListItem disabled>Loading...</ListItem> ) : (
                                                suggestions.map(med => (
                                                    <ListItem key={med._id} onClick={() => handleSuggestionClick(med)} className="...">
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex flex-col">
                                                                <Typography variant="small" className="font-bold">{med.brandName} - {med.strength}</Typography>
                                                                <Typography variant="small" className="opacity-80">{med.genericName}</Typography>
                                                            </div>
                                                            <IconButton variant="text" size="sm" onClick={(e) => handleViewDetails(med, e)}>
                                                                <EyeIcon className="h-5 w-5" />
                                                            </IconButton>
                                                        </div>
                                                    </ListItem>
                                                ))
                                            )}
                                        </List>
                                    </Card>
                                )}
                            </div>
                            <hr className="my-2 border-gray-300 dark:border-gray-700" />
                            {/* --- Medication Input Fields --- */}
                            {medications.map((med, index) => (
                                <div key={index} className="p-4 border rounded-lg border-gray-300 dark:border-gray-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input crossOrigin={""} name="medicationName" value={med.medicationName} onChange={(e) => handleMedicationChange(index, e)} label="Medication Name" required color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                                        <Input crossOrigin={""} name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} label="Dosage (e.g., 500mg)" color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                                        
                                        <Select label="Frequency" value={med.frequency} onChange={(value) => handleMedicationChange(index, value, 'frequency')} animate={{ mount: { y: 0 }, unmount: { y: 25 } }} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}} menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}>
                                            <Option value="1+1+1">১+১+১</Option>
                                            <Option value="1+0+1">১+০+১</Option>
                                            <Option value="1+0+0">১+০+০</Option>
                                            <Option value="0+0+1">০+০+১</Option>
                                            <Option value="দিনে ১ বার">দিনে ১ বার</Option>
                                            <Option value="দিনে ২ বার">দিনে ২ বার</Option>
                                        </Select>

                                        <Select label="Instruction" value={med.instruction} onChange={(value) => handleMedicationChange(index, value, 'instruction')} animate={{ mount: { y: 0 }, unmount: { y: 25 } }} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}} menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}>
                                            <Option value="খাবারের পরে">খাবারের পরে</Option>
                                            <Option value="খাবারের আগে">খাবারের আগে</Option>
                                            <Option value="খালি পেটে">খালি পেটে</Option>
                                            <Option value="প্রয়োজনে">প্রয়োজনে</Option>
                                        </Select>
                                    </div>
                                    {medications.length > 1 && <div className="flex justify-end mt-2"><Button size="sm" color="red" variant="text" onClick={() => removeMedicationField(index)}>Remove</Button></div>}
                                </div>
                            ))}

                            <Button size="sm" variant="outlined" onClick={addMedicationField} className="self-start text-light-text-secondary dark:text-dark-text-secondary border-light-text-secondary dark:border-dark-text-secondary hover:bg-gray-500/10">+ Add More Medicine</Button>
                            <Textarea label="General Notes..." name="generalNotes" value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                            <Textarea label="Suggested Reports..." name="suggestedReports" value={suggestedReports} onChange={(e) => setSuggestedReports(e.target.value)} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                            
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
                        prescriptions.slice().reverse().map(p => (
                            <Card key={p._id} className="p-4 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar src={p.doctorInfo.image || '/default-avatar.png'} alt={p.doctorInfo.name} size="sm" />
                                    <div>
                                        {/* FIX: Added theme-aware text colors */}
                                        <Typography variant="small" className="font-bold text-light-text-primary dark:text-dark-text-primary">
                                            Dr. {p.doctorInfo.name}
                                        </Typography>
                                        <Typography variant="small" className="opacity-80 text-light-text-secondary dark:text-dark-text-secondary">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </div>
                                    <div className="ml-auto">
                                        <IconButton variant="text" onClick={() => handleDownloadPdf(p._id)}>
                                            {/* FIX: Added theme-aware icon color */}
                                            <ArrowDownTrayIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"/>
                                        </IconButton>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-1 pl-4">
                                    {p.medications.map((med, index) => (
                                        med.medicationName && (
                                            <div key={index} className="flex flex-row items-start">
                                                {/* FIX: Added theme-aware text colors */}
                                                <Typography variant="small" as="span" className="w-6 font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                                    {index + 1}.
                                                </Typography>
                                                <Typography variant="small" as="div" className="flex-1 text-light-text-primary dark:text-dark-text-primary">
                                                    <strong>{med.medicationName}</strong>
                                                    {med.dosage && ` - ${med.dosage}`}
                                                    {med.frequency && `, ${med.frequency}`}
                                                    {med.instruction && ` (${med.instruction})`}
                                                </Typography>
                                            </div>
                                        )
                                    ))}
                                </div>
                                
                                {/* FIX: Added theme-aware text colors */}
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
                            
                            <div className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
                               <a href="https://hms-psi-three.vercel.app/" target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="filled" color="blue-gray">
                                        Generate Report
                                    </Button>
                                </a>

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
            <Dialog open={isDetailsModalOpen} handler={closeDetailsModal} className="bg-light-card dark:bg-dark-card ...">
                <DialogHeader className="flex justify-between  text-light-text-primary dark:text-dark-text-primary">
                    <Typography variant="h5" color="inherit">{selectedMedicine?.brandName}</Typography>
                    <IconButton variant="text" color="blue-gray" onClick={closeDetailsModal}><XMarkIcon className="h-5 w-5" /></IconButton>
                </DialogHeader>
                <DialogBody divider className="border-t border-b ...">
                    {selectedMedicine && (
                        <div className="flex flex-col gap-2 text-light-text-primary dark:text-dark-text-primary">
                            <p><strong>Generic Name:</strong> {selectedMedicine.genericName}</p>
                            <p><strong>Strength:</strong> {selectedMedicine.strength}</p>
                            <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</p>
                            <p><strong>Dosage Form:</strong> {selectedMedicine.dosageForm}</p>
                            <p><strong>Package Container:</strong> {selectedMedicine.packageContainer}</p>
                            <p><strong>Indications:</strong> {selectedMedicine.indications}</p>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="gradient" color="green" onClick={closeDetailsModal}>Close</Button>
                </DialogFooter>
            </Dialog>
            </div>
        </div>
    );
};

export default PatientProfilePage;