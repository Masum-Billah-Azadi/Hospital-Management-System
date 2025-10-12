// "use client";

// import { useParams } from 'next/navigation';
// import { useEffect, useState, useCallback } from 'react';
// import { 
//     Card, CardBody, CardHeader, Typography, Avatar, Button, IconButton,
//     Input, Textarea, List, ListItem, Spinner, Select, Option,
//     Dialog, DialogHeader, DialogBody, DialogFooter // Dialog কম্পোনেন্ট ইম্পোর্ট করুন
// } from '@material-tailwind/react';
// import { 
//     PencilIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon, EyeIcon, 
//     DocumentTextIcon, PhotoIcon, XMarkIcon // XMarkIcon ইম্পোর্ট করুন
// } from '@heroicons/react/24/solid';

// const PatientProfilePage = () => {
//     // --- আপনার পুরোনো সব state অপরিবর্তিত ---
//     // ...

//     // ===== নতুন state যোগ করা হয়েছে =====
//     const [searchTerm, setSearchTerm] = useState(''); // diagnosis এর পরিবর্তে searchTerm
//     const [suggestions, setSuggestions] = useState([]);
//     const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
//     const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//     const [selectedMedicine, setSelectedMedicine] = useState(null);

//     // --- আপনার পুরোনো সব ফাংশন অপরিবর্তিত ---
//     const fetchPatientProfile = useCallback(async () => { /* ... */ }, []);
//     useEffect(() => { if (patientId) { fetchPatientProfile(); } }, []);

//     // ===== সাজেশন খোঁজার useEffect আপডেট করা হয়েছে =====
//     useEffect(() => {
//         if (searchTerm.length < 3) {
//             setSuggestions([]);
//             return;
//         }
//         setIsFetchingSuggestions(true);
//         const handler = setTimeout(() => {
//             fetch(`/api/medicines/suggest?q=${searchTerm}`) // 'disease' এর পরিবর্তে 'q'
//                 .then(res => res.json())
//                 .then(data => {
//                     setSuggestions(data);
//                     setIsFetchingSuggestions(false);
//                 });
//         }, 500);

//         return () => clearTimeout(handler);
//     }, [searchTerm]);

//     // ===== নতুন handler ফাংশন যোগ করা হয়েছে =====
//     const handleSuggestionClick = (medicine) => {
//         const newMedications = medications.filter(med => med.medicationName);
//         setMedications([
//             ...newMedications,
//             { medicationName: medicine.brandName, dosage: medicine.strength, frequency: '', instruction: '' }
//         ]);
//         setSuggestions([]);
//         setSearchTerm('');
//     };

//     const handleViewDetails = (medicine, e) => {
//         e.stopPropagation(); // এটি ListItem-এর onClick ট্রিগার হওয়া থেকে বিরত রাখে
//         setSelectedMedicine(medicine);
//         setIsDetailsModalOpen(true);
//     };

//     const closeDetailsModal = () => setIsDetailsModalOpen(false);
    
//     // ... আপনার বাকি সব handler ফাংশন অপরিবর্তিত ...

//     if (loading) return <div className="..."><Spinner /></div>;
//     // ...

//     return (
//         <div className="flex flex-col gap-6">
//             {/* ... Header এবং Vitals কার্ড অপরিবর্তিত ... */}

//             {/* --- Add Prescription Card (আপডেট করা হয়েছে) --- */}
//             <Card className="w-full bg-light-card dark:bg-dark-card ...">
//                 {/* ... CardHeader অপরিবর্তিত ... */}
//                 {showMedicationForm && (
//                     <CardBody>
//                         <form onSubmit={handleMedicationSubmit} className="flex flex-col gap-4">
//                             {/* নতুন Diagnosis ইনপুট ফিল্ড */}
//                             <div className="relative">
//                                 <Input 
//                                     crossOrigin={""} 
//                                     label="Search by Disease, Brand or Generic Name..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     color="blue-gray" className="dark:text-white"
//                                 />
//                                 {(isFetchingSuggestions || suggestions.length > 0) && (
//                                     <Card className="absolute z-10 w-full mt-1 ...">
//                                         <List>
//                                             {isFetchingSuggestions ? ( <ListItem disabled>Loading...</ListItem> ) : (
//                                                 suggestions.map(med => (
//                                                     <ListItem key={med._id} onClick={() => handleSuggestionClick(med)} className="...">
//                                                         <div className="flex justify-between items-center w-full">
//                                                             <div className="flex flex-col">
//                                                                 <Typography variant="small" className="font-bold">{med.brandName} - {med.strength}</Typography>
//                                                                 <Typography variant="small" className="opacity-80">{med.genericName}</Typography>
//                                                             </div>
//                                                             <IconButton variant="text" size="sm" onClick={(e) => handleViewDetails(med, e)}>
//                                                                 <EyeIcon className="h-5 w-5" />
//                                                             </IconButton>
//                                                         </div>
//                                                     </ListItem>
//                                                 ))
//                                             )}
//                                         </List>
//                                     </Card>
//                                 )}
//                             </div>
//                             <hr className="my-2 border-gray-300 dark:border-gray-700" />
//                             {/* --- Medication Input Fields --- */}
//                             {medications.map((med, index) => (
//                                 <div key={index} className="p-4 border rounded-lg border-gray-300 dark:border-gray-700">
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <Input crossOrigin={""} name="medicationName" value={med.medicationName} onChange={(e) => handleMedicationChange(index, e)} label="Medication Name" required color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
//                                         <Input crossOrigin={""} name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} label="Dosage (e.g., 500mg)" color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                                        
//                                         <Select label="Frequency" value={med.frequency} onChange={(value) => handleMedicationChange(index, value, 'frequency')} animate={{ mount: { y: 0 }, unmount: { y: 25 } }} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}} menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}>
//                                             <Option value="1+1+1">১+১+১</Option>
//                                             <Option value="1+0+1">১+০+১</Option>
//                                             <Option value="1+0+0">১+০+০</Option>
//                                             <Option value="0+0+1">০+০+১</Option>
//                                             <Option value="দিনে ১ বার">দিনে ১ বার</Option>
//                                             <Option value="দিনে ২ বার">দিনে ২ বার</Option>
//                                         </Select>

//                                         <Select label="Instruction" value={med.instruction} onChange={(value) => handleMedicationChange(index, value, 'instruction')} animate={{ mount: { y: 0 }, unmount: { y: 25 } }} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}} menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}>
//                                             <Option value="খাবারের পরে">খাবারের পরে</Option>
//                                             <Option value="খাবারের আগে">খাবারের আগে</Option>
//                                             <Option value="খালি পেটে">খালি পেটে</Option>
//                                             <Option value="প্রয়োজনে">প্রয়োজনে</Option>
//                                         </Select>
//                                     </div>
//                                     {medications.length > 1 && <div className="flex justify-end mt-2"><Button size="sm" color="red" variant="text" onClick={() => removeMedicationField(index)}>Remove</Button></div>}
//                                 </div>
//                             ))}

//                             <Button size="sm" variant="outlined" onClick={addMedicationField} className="self-start text-light-text-secondary dark:text-dark-text-secondary border-light-text-secondary dark:border-dark-text-secondary hover:bg-gray-500/10">+ Add More Medicine</Button>
//                             <Textarea label="General Notes..." name="generalNotes" value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
//                             <Textarea label="Suggested Reports..." name="suggestedReports" value={suggestedReports} onChange={(e) => setSuggestedReports(e.target.value)} color="blue-gray" className="dark:text-white" labelProps={{className: "dark:!text-dark-text-secondary"}}/>
                            
//                             <div className="flex gap-2 justify-end">
//                                 <Button size="sm" variant="text" color="red" onClick={() => setShowMedicationForm(false)}>Cancel</Button>
//                                 <Button size="sm" color="green" type="submit">Save Prescription</Button>
//                             </div>
//                         </form>
//                     </CardBody>
//                 )}
//             </Card>

//             {/* ... Reports এবং Prescription History কার্ড অপরিবর্তিত ... */}

//             {/* ===== নতুন Medicine Details Modal ===== */}
//             <Dialog open={isDetailsModalOpen} handler={closeDetailsModal} className="bg-light-card dark:bg-dark-card ...">
//                 <DialogHeader className="flex justify-between">
//                     <Typography variant="h5" color="inherit">{selectedMedicine?.brandName}</Typography>
//                     <IconButton variant="text" color="blue-gray" onClick={closeDetailsModal}><XMarkIcon className="h-5 w-5" /></IconButton>
//                 </DialogHeader>
//                 <DialogBody divider className="border-t border-b ...">
//                     {selectedMedicine && (
//                         <div className="flex flex-col gap-2 text-light-text-primary dark:text-dark-text-primary">
//                             <p><strong>Generic Name:</strong> {selectedMedicine.genericName}</p>
//                             <p><strong>Strength:</strong> {selectedMedicine.strength}</p>
//                             <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</p>
//                             <p><strong>Dosage Form:</strong> {selectedMedicine.dosageForm}</p>
//                             <p className="mt-2"><strong>Indications:</strong></p>
//                             <Typography variant="small" className="opacity-90">{selectedMedicine.indications}</Typography>
//                         </div>
//                     )}
//                 </DialogBody>
//                 <DialogFooter>
//                     <Button variant="gradient" color="green" onClick={closeDetailsModal}>Close</Button>
//                 </DialogFooter>
//             </Dialog>
//         </div>
//     );
// };

// export default PatientProfilePage;