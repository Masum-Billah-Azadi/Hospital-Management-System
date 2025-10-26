// src/app/dashboard/patients/[patientId]/page.js
"use client";

import MedicineDetailsModal from "@/components/MedicineDetailsModal";
import PrescriptionsCard from "@/components/PrescriptionsCard";
import ReportSection from "@/components/ReportSection";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Input,
  List,
  ListItem,
  Option,
  Select,
  Spinner,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PatientProfilePage = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { patientId } = params;

  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsData, setVitalsData] = useState({ age: "", height: "", weight: "", bloodPressure: "" });
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medications, setMedications] = useState([{ medicationName: "", dosage: "", frequency: "", instruction: "" }]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [suggestedReports, setSuggestedReports] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // suggestion feature
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // medicine modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const fetchPatientProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error("Could not fetch patient profile.");
      const data = await res.json();
      setPatientData(data);
      setVitalsData({
        age: data.age || "",
        height: data.height || "",
        weight: data.weight || "",
        bloodPressure: data.bloodPressure || "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchPatientProfile();
  }, [patientId, fetchPatientProfile]);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    const handler = setTimeout(() => {
      fetch(`/api/medicines/suggest?q=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data || []);
          setIsFetchingSuggestions(false);
        })
        .catch(() => setIsFetchingSuggestions(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSuggestionClick = (medicine) => {
    const newMedications = medications.filter((m) => m.medicationName);
    setMedications([
      ...newMedications,
      { medicationName: medicine.brandName, dosage: medicine.strength, frequency: "", instruction: "" },
    ]);
    setSuggestions([]);
    setSearchTerm("");
  };

  const handleViewDetails = async (medicationName) => {
    setIsFetchingDetails(true);
    setIsDetailsModalOpen(true);
    try {
      const res = await fetch(`/api/medicines/search?name=${encodeURIComponent(medicationName)}`);
      if (!res.ok) throw new Error("Medicine details not found.");
      const data = await res.json();
      setSelectedMedicine(data);
    } catch (error) {
      console.error(error);
      setSelectedMedicine({ brandName: medicationName, indications: "Details not available." });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const closeDetailsModal = () => setIsDetailsModalOpen(false);

  const handleMedicationChange = (index, eventOrValue, fieldName) => {
    const updated = [...medications];
    if (fieldName) {
      updated[index][fieldName] = eventOrValue;
    } else {
      updated[index][eventOrValue.target.name] = eventOrValue.target.value;
    }
    setMedications(updated);
  };

  const addMedicationField = () => setMedications([...medications, { medicationName: "", dosage: "", frequency: "", instruction: "" }]);
  const removeMedicationField = (index) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleVitalsSave = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitalsData),
      });
      if (!res.ok) throw new Error("Failed to update vitals.");
      const updated = await res.json();
      setPatientData(updated);
      setIsEditingVitals(false);
      alert("Vitals updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating vitals.");
    }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    const reportsArray = suggestedReports.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: patientData._id,
          medications,
          generalNotes,
          suggestedReports: reportsArray,
        }),
      });
      if (!res.ok) throw new Error("Failed to add prescription.");
      const { prescription } = await res.json();
      setPatientData((prev) => ({ ...prev, prescriptions: [prescription, ...(prev.prescriptions || [])] }));
      setMedications([{ medicationName: "", dosage: "", frequency: "", instruction: "" }]);
      setGeneralNotes("");
      setSuggestedReports("");
      setShowMedicationForm(false);
    } catch (error) {
      console.error(error);
      alert("Error adding prescription.");
    }
  };

  const handleReportUploadByDoctor = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("File upload failed.");
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const saveRes = await fetch(`/api/patients/${patientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report: { fileName: uploadData.fileName, url: uploadData.url } }),
        });
        if (!saveRes.ok) throw new Error("Failed to save report.");
        const updateData = await saveRes.json();
        setPatientData(updateData);
        alert("Report added successfully!");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleDownloadPdf = (prescriptionId) => {
    window.open(`/api/prescriptions/${prescriptionId}/pdf`, "_blank");
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner className="h-16 w-16" /></div>;
  if (!patientData) return <Typography>Patient profile not found.</Typography>;

  const { user, prescriptions, reports } = patientData;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
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
        {/* Vitals Card (unchanged) */}
        <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
          <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Typography variant="h6">Vitals</Typography>
              {!isEditingVitals && <IconButton variant="text" onClick={() => setIsEditingVitals(true)}><PencilIcon className="h-5 w-5" /></IconButton>}
            </div>
          </CardHeader>
          <CardBody>
            {isEditingVitals ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Age" name="age" value={vitalsData.age} onChange={(e) => setVitalsData(prev => ({...prev, [e.target.name]: e.target.value }))} />
                  <Input label="Height" name="height" value={vitalsData.height} onChange={(e) => setVitalsData(prev => ({...prev, [e.target.name]: e.target.value }))} />
                  <Input label="Weight" name="weight" value={vitalsData.weight} onChange={(e) => setVitalsData(prev => ({...prev, [e.target.name]: e.target.value }))} />
                  <Input label="Blood Pressure" name="bloodPressure" value={vitalsData.bloodPressure} onChange={(e) => setVitalsData(prev => ({...prev, [e.target.name]: e.target.value }))} />
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

        {/* Add Prescription Card (unchanged) */}
        <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
          <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Typography variant="h6">Add New Prescription</Typography>
              {!showMedicationForm && <Button size="sm" onClick={() => setShowMedicationForm(true)}>Create</Button>}
            </div>
          </CardHeader>

          {showMedicationForm && (
            <CardBody>
              <form onSubmit={handleMedicationSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Input label="Search by Disease, Brand or Generic Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {(isFetchingSuggestions || suggestions.length > 0) && (
                    <Card className="absolute z-10 w-full mt-1">
                      <List>
                        {isFetchingSuggestions ? (<ListItem disabled>Loading...</ListItem>) : (
                          suggestions.map(med => (
                            <ListItem key={med._id} onClick={() => handleSuggestionClick(med)}>
                              <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col">
                                  <Typography variant="small" className="font-bold">{med.brandName} - {med.strength}</Typography>
                                  <Typography variant="small" className="opacity-80">{med.genericName}</Typography>
                                </div>
                                <IconButton variant="text" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(med.brandName); }}>
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

                {/* Medication form fields */}
                {medications.map((med, index) => (
                  <div key={index} className="p-4 border rounded-lg border-gray-300 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input name="medicationName" value={med.medicationName} onChange={(e) => handleMedicationChange(index, e)} label="Medication Name" required />
                      <Input name="dosage" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} label="Dosage (e.g., 500mg)" />
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

                <Button size="sm" variant="outlined" onClick={addMedicationField}>+ Add More Medicine</Button>
                <Textarea label="General Notes..." value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} />
                <Textarea label="Suggested Reports..." value={suggestedReports} onChange={(e) => setSuggestedReports(e.target.value)} />

                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="text" color="red" onClick={() => setShowMedicationForm(false)}>Cancel</Button>
                  <Button size="sm" color="green" type="submit">Save Prescription</Button>
                </div>
              </form>
            </CardBody>
          )}
        </Card>

        {/* Use shared PrescriptionsCard for history */}
        <PrescriptionsCard
          prescriptions={prescriptions}
          title="Prescription History"
          onDownloadPdf={handleDownloadPdf}
          onViewMedicineDetails={handleViewDetails}
          emptyText="No prescriptions found."
        />

        {/* Reports Card (unchanged) */}
        <ReportSection
          reports={reports}
          isUploading={isUploading}
          handleReportUpload={handleReportUploadByDoctor}
          showGenerateButton={true}
          pageType="doctor"
        />

      </div>

      <MedicineDetailsModal
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
        medicine={selectedMedicine}
        loading={isFetchingDetails}
      />
    </div>
  );
};

export default PatientProfilePage;
