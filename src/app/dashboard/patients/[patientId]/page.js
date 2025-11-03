"use client";

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

import MedicineDetailsModal from "@/components/MedicineDetailsModal";
import PrescriptionsCard from "@/components/PrescriptionsCard";
import ReportSection from "@/components/ReportSection";

const PatientProfilePage = () => {
  const { patientId } = useParams();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- Vitals ----
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    age: "",
    height: "",
    weight: "",
    bloodPressure: "",
  });

  // ---- Prescription Form ----
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medications, setMedications] = useState([
    {
      medicationName: "",
      dosage: "",
      frequency: "",
      instruction: "",
      price: "",
      duration: { value: "", unit: "day" },
    },
  ]);

  const [generalNotes, setGeneralNotes] = useState("");
  const [suggestedReports, setSuggestedReports] = useState("");
  const [followUp, setFollowUp] = useState({ value: "", unit: "day" });

  const [isUploading, setIsUploading] = useState(false);

  // ---- Suggestions ----
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(false);

  // ---- Modal ----
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  /* ===========================================================
   ✅ Fetch Patient Profile
  ============================================================ */
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

  /* ===========================================================
   ✅ Medicine Suggestion Search
  ============================================================ */
  const fetchSuggestions = useCallback(
    (pageToFetch, replaceList = false) => {
      setIsFetchingSuggestions(true);
      fetch(
        `/api/medicines/suggest?q=${encodeURIComponent(
          searchTerm,
        )}&page=${pageToFetch}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (replaceList) setSuggestions(data.suggestions || []);
          else
            setSuggestions((prev) => [
              ...prev,
              ...(data.suggestions || []),
            ]);

          setHasMoreSuggestions(data.hasMore || false);
          setCurrentPage(pageToFetch);
        })
        .finally(() => setIsFetchingSuggestions(false));
    },
    [searchTerm],
  );

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      setCurrentPage(1);
      setHasMoreSuggestions(false);
      return;
    }
    fetchSuggestions(1, true);
  }, [searchTerm, fetchSuggestions]);

  const handleLoadMore = () => {
    if (!isFetchingSuggestions && hasMoreSuggestions)
      fetchSuggestions(currentPage + 1, false);
  };

  const handleSuggestionClick = (medicine) => {
    const validMeds = medications.filter((m) => m.medicationName);

    setMedications([
      ...validMeds,
      {
        medicationName: medicine.brandName || "",
        dosage: medicine.strength || "",
        frequency: "",
        instruction: "",
        price: medicine.price || "",
        duration: { value: "", unit: "day" },
      },
    ]);

    setSuggestions([]);
    setSearchTerm("");
  };

  /* ===========================================================
   ✅ Medicine Details Modal
  ============================================================ */
  const handleViewDetails = async (medicine) => {
    setIsFetchingDetails(true);
    setIsDetailsModalOpen(true);

    try {
      const url = medicine._id
        ? `/api/medicines/${medicine._id}`
        : `/api/medicines/search?name=${encodeURIComponent(
            medicine.brandName || medicine,
          )}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Medicine details not found.");

      const data = await res.json();
      setSelectedMedicine(data);
    } catch {
      setSelectedMedicine({
        brandName: medicine.brandName || medicine,
        indications: "Details not available.",
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const closeDetailsModal = () => setIsDetailsModalOpen(false);

  /* ===========================================================
   ✅ Update Medication Inputs
  ============================================================ */
  const handleMedicationChange = (index, eventOrValue, fieldName) => {
    const updated = [...medications];

    if (fieldName) {
      updated[index][fieldName] = eventOrValue;
    } else {
      updated[index][eventOrValue.target.name] =
        eventOrValue.target.value;
    }

    setMedications(updated);
  };

  const addMedicationField = () =>
    setMedications([
      ...medications,
      {
        medicationName: "",
        dosage: "",
        frequency: "",
        instruction: "",
        price: "",
        duration: { value: "", unit: "day" },
      },
    ]);

  const removeMedicationField = (index) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  /* ===========================================================
   ✅ Save Vitals
  ============================================================ */
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
    } catch (error) {
      alert("Error updating vitals.");
    }
  };

  /* ===========================================================
   ✅ Submit Prescription
  ============================================================ */
  const handleMedicationSubmit = async (e) => {
    e.preventDefault();

    const reportsArray = suggestedReports
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: patientData._id,
          medications,
          generalNotes,
          suggestedReports: reportsArray,
          followUp, // ✅ NEW
        }),
      });

      if (!res.ok) throw new Error("Failed to add prescription.");

      const { prescription } = await res.json();

      setPatientData((prev) => ({
        ...prev,
        prescriptions: [prescription, ...(prev.prescriptions || [])],
      }));

      // Reset
      setMedications([
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          instruction: "",
          price: "",
          duration: { value: "", unit: "day" },
        },
      ]);

      setGeneralNotes("");
      setSuggestedReports("");
      setFollowUp({ value: "", unit: "day" });
      setShowMedicationForm(false);
    } catch {
      alert("Error adding prescription.");
    }
  };

  /* ===========================================================
   ✅ Upload Report
  ============================================================ */
  const handleReportUploadByDoctor = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const uploadData = await uploadRes.json();

      const saveRes = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: {
            fileName: uploadData.fileName,
            url: uploadData.url,
          },
        }),
      });

      const updateData = await saveRes.json();
      setPatientData(updateData);
    } catch {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  /* ===========================================================
   ✅ PDF Download
  ============================================================ */
  const handleDownloadPdf = (prescriptionId) =>
    window.open(`/api/prescriptions/${prescriptionId}/pdf`, "_blank");

  /* ===========================================================
   ✅ UI Rendering
  ============================================================ */

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16" />
      </div>
    );

  if (!patientData) return <Typography>Patient not found.</Typography>;

  const { user, prescriptions, reports } = patientData;

  /* ===========================================================
   ✅ JSX
  ============================================================ */

  return (
    <div className="flex flex-col gap-6">
      {/* Patient Header */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <Avatar
              src={
                user.image ||
                `https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, "+")}`
              }
              alt={user.name}
              size="xxl"
            />
            <div>
              <Typography variant="h4">{user.name}</Typography>
              <Typography className="opacity-80">{user.email}</Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Vitals */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">Vitals</Typography>
            {!isEditingVitals && (
              <IconButton variant="text" onClick={() => setIsEditingVitals(true)}>
                <PencilIcon className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        </CardHeader>

        <CardBody>
          {isEditingVitals ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  name="age"
                  value={vitalsData.age}
                  onChange={(e) =>
                    setVitalsData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                  }
                />
                <Input
                  label="Height"
                  name="height"
                  value={vitalsData.height}
                  onChange={(e) =>
                    setVitalsData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                  }
                />
                <Input
                  label="Weight"
                  name="weight"
                  value={vitalsData.weight}
                  onChange={(e) =>
                    setVitalsData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                  }
                />
                <Input
                  label="Blood Pressure"
                  name="bloodPressure"
                  value={vitalsData.bloodPressure}
                  onChange={(e) =>
                    setVitalsData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="text" color="red" onClick={() => setIsEditingVitals(false)}>
                  Cancel
                </Button>
                <Button size="sm" color="green" onClick={handleVitalsSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-light-text-primary dark:text-dark-text-primary">
              <li><strong>Age:</strong> {patientData.age || "N/A"}</li>
              <li><strong>Height:</strong> {patientData.height || "N/A"}</li>
              <li><strong>Weight:</strong> {patientData.weight || "N/A"}</li>
              <li><strong>Blood Pressure:</strong> {patientData.bloodPressure || "N/A"}</li>
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Add Prescription */}
      <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
          <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Typography variant="h6" className=" text-light-text-primary dark:text-dark-text-primary">Add New Prescription</Typography>
              {!showMedicationForm && <Button size="sm" onClick={() => setShowMedicationForm(true)}>Create</Button>}
            </div>
          </CardHeader>

          {showMedicationForm && (
            <CardBody>
        <form onSubmit={handleMedicationSubmit} className="flex flex-col gap-6">
          {/* Search & Suggestions */}
          <div className="relative">
            <Input
              crossOrigin={""}
              label="Search by Disease, Brand or Generic Name..."
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              color="blue-gray"
              className="dark:text-white"
              labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
            />
            {/* --- সাজেশন লিস্ট --- */}
            {(searchTerm.length >= 3 &&
              (isFetchingSuggestions || suggestions.length > 0 || hasMoreSuggestions)) && (
              <Card className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-700">
                <List>
                  {isFetchingSuggestions ? (
                    <ListItem disabled className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</ListItem>
                  ) : (
                    suggestions.map((med) => (
                      <ListItem
                        key={med._id}
                        onClick={() => handleSuggestionClick(med)}
                        className="flex justify-between text-light-text-primary dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <div>
                          <Typography variant="small" color="inherit" className="font-bold">
                            {med.brandName} - {med.strength}
                          </Typography>
                          <Typography variant="small" color="inherit" className="opacity-80">
                            {med.genericName}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-2 opacity-80 text-[13px]">
                          ⭐ {med.rating?.toFixed(1) || 0}
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(med);
                            }}
                          >
                            <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                          </IconButton>
                        </div>
                      </ListItem>
                    ))
                  )}
                  {hasMoreSuggestions && (
                    <ListItem
                      onClick={handleLoadMore}
                      disabled={isFetchingSuggestions}
                      className="justify-center text-primary font-bold cursor-pointer"
                    >
                      {isFetchingSuggestions ? <Spinner className="h-4 w-4" /> : "Load More..."}
                    </ListItem>
                  )}
                </List>
              </Card>
            )}
          </div>

          {/* --- মেডিসিন ফিল্ড --- */}
          {medications.map((med, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg border-gray-300 dark:border-gray-700 bg-light-bg dark:bg-dark-bg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  crossOrigin={""} name="medicationName" value={med.medicationName}
                  onChange={(e) => handleMedicationChange(index, e)}
                  label="Medication Name" required color="blue-gray"
                  className="dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                />
                <Input
                  crossOrigin={""} name="dosage" value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, e)}
                  label="Dosage (e.g., 500mg)" color="blue-gray"
                  className="dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                />
                <Input
                  crossOrigin={""} name="price" value={med.price}
                  onChange={(e) => handleMedicationChange(index, e)}
                  label="Price" type="number" color="blue-gray"
                  className="dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                />
                <Select
                  label="Frequency" value={med.frequency}
                  onChange={(value) => handleMedicationChange(index, value, "frequency")}
                  color="blue-gray" className="dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                  menuProps={{ className: "bg-light-card dark:bg-dark-card ..." }}
                >
                  <Option value="দিনে ১ বার">দিনে ১ বার</Option>
                  <Option value="দিনে ২ বার">দিনে ২ বার</Option>
                  <Option value="দিনে ৩ বার">দিনে ৩ বার</Option>
                  <Option value="১+১+১">১+১+১</Option>
                  <Option value="১+০+১">১+০+১</Option>
                  <Option value="১+০+০">১+০+০</Option>
                  <Option value="০+০+১">০+০+১</Option>
                </Select>
                <Select
                  label="Instruction" value={med.instruction}
                  onChange={(value) => handleMedicationChange(index, value, "instruction")}
                  color="blue-gray" className="dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                  menuProps={{ className: "bg-light-card dark:bg-dark-card ..." }}
                >
                  <Option value="খাবারের পরে">খাবারের পরে</Option>
                  <Option value="খাবারের আগে">খাবারের আগে</Option>
                  <Option value="খালি পেটে">খালি পেটে</Option>
                  <Option value="প্রয়োজনে">প্রয়োজনে</Option>
                </Select>

                {/* ===== FIX: Duration ডিজাইন ঠিক করা হয়েছে ===== */}
                <div className="relative h-10 w-full">
                  <div className="flex items-center h-full">
                    <Input
                      crossOrigin={""}
                      type="number"
                      min="1"
                      label="Duration"
                      value={med.duration?.value || ""}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          { value: e.target.value, unit: med.duration?.unit || "day" },
                          "duration"
                        )
                      }
                      color="blue-gray"
                      className="rounded-r-none border-r-0 dark:text-white"
                      labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                      containerProps={{ className: "min-w-[70%]" }}
                    />
                    <Select
                      value={med.duration?.unit || "day"}
                      onChange={(value) =>
                        handleMedicationChange(
                          index,
                          { value: med.duration?.value || "", unit: value },
                          "duration"
                        )
                      }
                      className="rounded-l-none border-l-0 dark:text-white"
                      color="blue-gray"
                      // labelProps={{ className: "hidden" }} // ইনপুটের লেবেলটিই যথেষ্ট
                      containerProps={{ className: "min-w-[30%]" }}
                      menuProps={{ className: "bg-light-card dark:bg-dark-card ..." }}
                    >
                      <Option value="day">দিন</Option>
                      <Option value="week">সপ্তাহ</Option>
                      <Option value="month">মাস</Option>
                      <Option value="continue">চলবে</Option>
                    </Select>
                  </div>
                </div>
              </div>

              {medications.length > 1 && (
                <div className="flex justify-end mt-2">
                  <Button size="sm" color="red" variant="text" onClick={() => removeMedicationField(index)}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button size="sm" variant="outlined" onClick={addMedicationField} className="rounded-full shadow-sm border-gray-400 text-gray-800 dark:border-gray-300 dark:text-gray-200 dark:hover:bg-gray-700 self-start ...">
            + Add More Medicine
          </Button>

          <Textarea
            label="General Notes..." value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            color="blue-gray" className="dark:text-white"
            labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
          />
          <Textarea
            label="Suggested Reports..." value={suggestedReports}
            onChange={(e) => setSuggestedReports(e.target.value)}
            color="blue-gray" className="dark:text-white"
            labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
          />
          
          {/* ===== FIX: Follow-Up ডিজাইন ঠিক করা হয়েছে ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative h-10 w-full">
              <div className="flex items-center h-full">
                <Input
                  crossOrigin={""}
                  type="number"
                  min="1"
                  label="Follow-Up After"
                  value={followUp.value}
                  onChange={(e) =>
                    setFollowUp({ value: e.target.value, unit: followUp.unit })
                  }
                  color="blue-gray"
                  className="rounded-r-none border-r-0 dark:text-white"
                  labelProps={{ className: "dark:!text-dark-text-secondary font-medium" }}
                  containerProps={{ className: "min-w-[70%]" }}
                />
                <Select
                  value={followUp.unit}
                  onChange={(value) =>
                    setFollowUp({ value: followUp.value, unit: value })
                  }
                  className="rounded-l-none border-l-0 dark:text-white"
                  color="blue-gray"
                  // labelProps={{ className: "hidden" }}
                  containerProps={{ className: "min-w-[30%]" }}
                  menuProps={{ className: "bg-light-card dark:bg-dark-card ..." }}
                >
                  <Option value="day">দিন</Option>
                  <Option value="week">সপ্তাহ</Option>
                  <Option value="month">মাস</Option>
                </Select>
              </div>
            </div>
            <div></div> {/* Placeholder for the second column */}
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="text" color="red" onClick={() => setShowMedicationForm(false)}>
              Cancel
            </Button>
            <Button size="sm" color="green" type="submit">
              Save Prescription
            </Button>
          </div>
        </form>
            </CardBody>
          )}
      </Card>

      {/* Prescription History */}
      <PrescriptionsCard
        prescriptions={prescriptions}
        title="Prescription History"
        onDownloadPdf={handleDownloadPdf}
        onViewMedicineDetails={handleViewDetails}
        emptyText="No prescriptions found."
      />

      {/* Report Section */}
      <ReportSection
        reports={reports}
        isUploading={isUploading}
        handleReportUpload={handleReportUploadByDoctor}
        showGenerateButton={true}
        pageType="doctor"
      />

      {/* Modal */}
      <MedicineDetailsModal
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
        medicine={selectedMedicine}
        loading={isFetchingDetails}
        onUpdate={(updated) => {
          setSelectedMedicine({ ...updated });

          // keep suggestions live-updated
          setSuggestions((prev) =>
            prev
              .map((m) => (m._id === updated._id ? updated : m))
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          );
        }}
      />
    </div>
  );
};

export default PatientProfilePage;
