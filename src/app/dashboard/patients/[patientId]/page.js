"use client";

import { PencilIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  IconButton,
  Input,
  Option,
  Select,
  Spinner,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import PrescriptionsCard from "@/components/PrescriptionsCard";

const PatientProfilePage = () => {
  const { patientId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    age: "",
    height: "",
    weight: "",
    bloodPressure: "",
  });

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // ✅ রিয়েল ডাটাবেস থেকে আসা রেপার্টরি ডাটা রাখার স্টেট
  const [repertoryData, setRepertoryData] = useState([]);

  const [homeoMedications, setHomeoMedications] = useState([
    { medicineName: "", power: "", instruction: "" },
  ]);

  const [finalPrescriptionNotes, setFinalPrescriptionNotes] = useState("");
  const [homeoPrescriptions, setHomeoPrescriptions] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchPatientProfile = useCallback(async () => {
    setLoading(true);
    try {
      // ১. পেশেন্টের ডাটা ফেচ
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error("Could not fetch patient profile.");
      const data = await res.json();
      setPatientData(data);

      setVitalsData({
        age: data.age || "",
        height: data.height || "",
        weight: data.weight || "",
        bloodPressure: data.bloodPressure || "",
        gender: data.gender || "",
      });

      // ২. পেশেন্টের আগের হোমিও প্রেসক্রিপশন ফেচ
      const homeoRes = await fetch(
        `/api/homeo-prescriptions?patientId=${data._id}`,
      );
      if (homeoRes.ok) {
        const homeoData = await homeoRes.json();
        setHomeoPrescriptions(homeoData);
      }

      // ৩. ডাটাবেস থেকে রেপার্টরি (লক্ষণ) এর ডাটা ফেচ
      const repRes = await fetch("/api/homeo-repertory");
      if (repRes.ok) {
        const repData = await repRes.json();
        setRepertoryData(repData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId && status === "authenticated") fetchPatientProfile();
  }, [patientId, status, fetchPatientProfile]);

  // ফ্লাট লিস্ট (শুধুমাত্র লক্ষণগুলো একসাথে করার জন্য, যাতে মেডিসিন কাউন্ট করা সহজ হয়)
  const allSymptomsFlat = repertoryData.flatMap((cat) => cat.symptoms);

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId],
    );
  };

  const calculateRepertoryResult = () => {
    if (selectedSymptoms.length === 0)
      return "কোনো লক্ষণ নির্বাচন করা হয়নি...";
    let allMeds = [];
    selectedSymptoms.forEach((symptomId) => {
      // MongoDB এর আইডি হিসেবে _id ব্যবহার করা হয়েছে
      const symp = allSymptomsFlat.find((s) => s._id === symptomId);
      if (symp && symp.medicines) {
        allMeds.push(...symp.medicines);
      }
    });

    const counts = {};
    allMeds.forEach((med) => {
      counts[med] = (counts[med] || 0) + 1;
    });

    const sortedMeds = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const formattedResult = sortedMeds.map(([med, count]) => {
      return count > 1 ? `${med}(${count})` : med;
    });

    return formattedResult.join(", ");
  };

  const handleHomeoMedChange = (index, field, value) => {
    const updated = [...homeoMedications];
    updated[index][field] = value;
    setHomeoMedications(updated);
  };

  const addHomeoMedicationField = () => {
    setHomeoMedications([
      ...homeoMedications,
      { medicineName: "", power: "", instruction: "" },
    ]);
  };

  const removeHomeoMedicationField = (index) => {
    if (homeoMedications.length <= 1) return;
    setHomeoMedications(homeoMedications.filter((_, i) => i !== index));
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
    } catch (error) {
      alert("Error updating vitals.");
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedSymptomNames = selectedSymptoms
        .map((id) => {
          for (const cat of repertoryData) {
            const symp = cat.symptoms.find((s) => s._id === id);
            if (symp) return `${cat.category} : ${symp.name}`;
          }
          return null;
        })
        .filter(Boolean);

      const validMedicines = homeoMedications.filter(
        (med) => med.medicineName.trim() !== "",
      );

      const res = await fetch("/api/homeo-prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: patientData._id,
          doctorId: session?.user?.id || session?.user?._id,
          selectedSymptoms: selectedSymptomNames,
          repertoryResult: calculateRepertoryResult(),
          medicines: validMedicines,
          generalNotes: finalPrescriptionNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to add prescription.");

      const { prescription } = await res.json();
      const newRecord = {
        ...prescription,
        doctor: { name: session?.user?.name },
      };

      setHomeoPrescriptions([newRecord, ...homeoPrescriptions]);

      setSelectedSymptoms([]);
      setHomeoMedications([{ medicineName: "", power: "", instruction: "" }]);
      setFinalPrescriptionNotes("");
      setShowMedicationForm(false);
      alert("Homeo Prescription saved successfully!");
    } catch {
      alert("Error saving prescription.");
    }
  };

  const handleDownloadPdf = (prescriptionId) =>
    window.open(`/api/prescriptions/${prescriptionId}/pdf`, "_blank");

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;
  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spinner className="h-16 w-16" />
      </div>
    );
  if (!patientData) return <Typography>Patient not found.</Typography>;

  const { user, prescriptions } = patientData;

  return (
    <div className="flex flex-col gap-6">
      {/* Patient Header */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <Avatar
              src={
                user?.image ||
                `https://ui-avatars.com/api/?name=${user?.name?.replace(/\s/g, "+")}`
              }
              alt={user?.name || "Patient"}
              size="xxl"
              className="border-2 border-blue-500 w-28 h-28"
            />
            <div>
              <Typography variant="h3" className="mb-2 font-bold">
                {user?.name}
              </Typography>
              <div className="flex flex-col gap-2 mt-2">
                <Typography className="opacity-90 font-medium flex items-center justify-center sm:justify-start gap-2 text-lg">
                  📞 {patientData?.phone || "Phone number not added"}
                </Typography>
                <Typography className="opacity-90 flex items-center justify-center sm:justify-start gap-2 text-lg">
                  📍 {patientData?.address || "Address not added"}
                </Typography>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Vitals */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-transparent"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
            <Typography variant="h5" className="font-bold">
              Vitals
            </Typography>
            {!isEditingVitals && (
              <IconButton
                variant="text"
                onClick={() => setIsEditingVitals(true)}
              >
                <PencilIcon className="h-6 w-6" />
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
                    setVitalsData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  color="blue"
                  className="dark:text-white text-lg"
                />
                <Input
                  label="Height"
                  name="height"
                  value={vitalsData.height}
                  onChange={(e) =>
                    setVitalsData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  color="blue"
                  className="dark:text-white text-lg"
                />
                <Input
                  label="Weight"
                  name="weight"
                  value={vitalsData.weight}
                  onChange={(e) =>
                    setVitalsData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  color="blue"
                  className="dark:text-white text-lg"
                />
                <Input
                  label="Blood Pressure"
                  name="bloodPressure"
                  value={vitalsData.bloodPressure}
                  onChange={(e) =>
                    setVitalsData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  color="blue"
                  className="dark:text-white text-lg"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  size="md"
                  variant="text"
                  color="red"
                  onClick={() => setIsEditingVitals(false)}
                >
                  Cancel
                </Button>
                <Button size="md" color="green" onClick={handleVitalsSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-light-text-primary dark:text-dark-text-primary text-lg">
              <li>
                <strong>Age:</strong>{" "}
                <span className="ml-1 opacity-90">
                  {patientData.age || "N/A"}
                </span>
              </li>
              <li>
                <strong>Height:</strong>{" "}
                <span className="ml-1 opacity-90">
                  {patientData.height || "N/A"}
                </span>
              </li>
              <li>
                <strong>Weight:</strong>{" "}
                <span className="ml-1 opacity-90">
                  {patientData.weight || "N/A"}
                </span>
              </li>
              <li>
                <strong>Blood Pressure:</strong>{" "}
                <span className="ml-1 opacity-90">
                  {patientData.bloodPressure || "N/A"}
                </span>
              </li>
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Homeopathy Repertory Form */}
      <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-transparent"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="h5" className="font-bold">
              Homeopathy Repertory (লক্ষণ নির্বাচন)
            </Typography>
            {!showMedicationForm && (
              <Button
                size="md"
                color="blue"
                onClick={() => setShowMedicationForm(true)}
                className="text-sm"
              >
                + New Prescription
              </Button>
            )}
          </div>
        </CardHeader>
        {showMedicationForm && (
          <CardBody>
            <form
              onSubmit={handlePrescriptionSubmit}
              className="flex flex-col gap-8"
            >
              {/* Medicine Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <Typography className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-lg uppercase tracking-wide">
                  Medicine Box (Repertory Result):
                </Typography>
                <Typography className="text-2xl font-mono text-gray-900 dark:text-gray-100 break-words leading-relaxed">
                  {calculateRepertoryResult()}
                </Typography>
              </div>

              {/* ডাটাবেস থেকে লক্ষণ নির্বাচন */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 max-h-[500px] overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                <Typography className="font-bold mb-5 opacity-90 text-xl border-b border-gray-300 dark:border-gray-600 pb-3">
                  রোগীর লক্ষণসমূহ নির্বাচন করুন:
                </Typography>

                {repertoryData.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {repertoryData.map((cat, catIndex) => (
                      <div
                        key={catIndex}
                        className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800"
                      >
                        <Typography className="font-bold text-blue-700 dark:text-blue-300 mb-3 text-lg">
                          {cat.category}
                        </Typography>
                        <div className="flex flex-col gap-2 ml-3">
                          {cat.symptoms.map((symp) => (
                            <label
                              key={symp._id}
                              className="flex items-center cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                              {/* symp.id এর বদলে symp._id ব্যবহার করা হয়েছে */}
                              <Checkbox
                                color="blue"
                                checked={selectedSymptoms.includes(symp._id)}
                                onChange={() => handleSymptomToggle(symp._id)}
                                className="w-6 h-6"
                              />
                              <Typography className="ml-4 font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">
                                {symp.name}
                              </Typography>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography className="text-center opacity-70 italic">
                    কোনো রেপার্টরি ডাটা পাওয়া যায়নি। দয়া করে আগে রেপার্টরি
                    সেটআপ করুন।
                  </Typography>
                )}
              </div>

              {/* চূড়ান্ত ঔষধ নির্বাচন */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-5">
                <Typography className="font-bold opacity-90 text-xl border-b border-gray-300 dark:border-gray-600 pb-3">
                  চূড়ান্ত ঔষধ নির্বাচন (Rx):
                </Typography>

                {homeoMedications.map((med, index) => (
                  <div
                    key={index}
                    // ✅ স্মার্ট গ্রিড লেআউট: মাঝারি স্ক্রিনে ২ লাইন, বড় স্ক্রিনে ১ লাইন
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800"
                  >
                    {/* ১. মেডিসিন নাম (মাঝারি স্ক্রিনে ফুল উইডথ, বড় স্ক্রিনে ৫ কলাম) */}
                    <div className="md:col-span-12 xl:col-span-5 w-full">
                      <Input
                        label="মেডিসিন নাম্বার/নাম *"
                        value={med.medicineName}
                        onChange={(e) =>
                          handleHomeoMedChange(
                            index,
                            "medicineName",
                            e.target.value,
                          )
                        }
                        color="blue"
                        className="dark:text-white text-lg"
                        labelProps={{ className: "text-base" }}
                        containerProps={{ className: "!min-w-[100px]" }} // ✅ ওভারল্যাপ বন্ধ করার ম্যাজিক
                        required
                      />
                    </div>

                    {/* ২. শক্তি/পাওয়ার (মাঝারি স্ক্রিনে ৫ কলাম, বড় স্ক্রিনে ৩ কলাম) */}
                    <div className="md:col-span-5 xl:col-span-3 w-full">
                      <Select
                        label="শক্তি"
                        value={med.power}
                        onChange={(val) =>
                          handleHomeoMedChange(index, "power", val)
                        }
                        color="blue"
                        className="dark:text-white text-lg"
                        labelProps={{ className: "text-base" }}
                        containerProps={{ className: "!min-w-[100px]" }} // ✅ ওভারল্যাপ বন্ধ করার ম্যাজিক
                        menuProps={{
                          className:
                            "bg-white dark:bg-gray-900 text-black dark:text-white text-lg",
                        }}
                      >
                        <Option value="Q (মাদার)">Q (মাদার)</Option>
                        <Option value="3X">3X</Option>
                        <Option value="6X">6X</Option>
                        <Option value="12X">12X</Option>
                        <Option value="30">30</Option>
                        <Option value="200">200</Option>
                        <Option value="1M">1M</Option>
                        <Option value="10M">10M</Option>
                        <Option value="50M">50M</Option>
                        <Option value="CM">CM</Option>
                      </Select>
                    </div>

                    {/* ৩. খাওয়ার নিয়ম এবং ডিলিট বাটন (মাঝারি স্ক্রিনে ৭ কলাম, বড় স্ক্রিনে ৪ কলাম) */}
                    <div className="md:col-span-7 xl:col-span-4 w-full flex items-center gap-3">
                      <div className="flex-1">
                        <Select
                          label="খাওয়ার নিয়ম"
                          value={med.instruction}
                          onChange={(val) =>
                            handleHomeoMedChange(index, "instruction", val)
                          }
                          color="blue"
                          className="dark:text-white text-lg"
                          labelProps={{ className: "text-base" }}
                          containerProps={{ className: "!min-w-[100px]" }} // ✅ ওভারল্যাপ বন্ধ করার ম্যাজিক
                          menuProps={{
                            className:
                              "bg-white dark:bg-gray-900 text-black dark:text-white text-lg",
                          }}
                        >
                          <Option value="সকালে খালি পেটে">
                            সকালে খালি পেটে
                          </Option>
                          <Option value="দিনে ২ বার">দিনে ২ বার</Option>
                          <Option value="দিনে ৩ বার">দিনে ৩ বার</Option>
                          <Option value="দিনে ৪ বার">দিনে ৪ বার</Option>
                          <Option value="খাওয়ার আগে">খাওয়ার আগে</Option>
                          <Option value="খাওয়ার পরে">খাওয়ার পরে</Option>
                          <Option value="ঘুমানোর আগে">ঘুমানোর আগে</Option>
                          <Option value="প্রয়োজন অনুযায়ী">
                            প্রয়োজন অনুযায়ী
                          </Option>
                        </Select>
                      </div>

                      {/* ডিলিট বাটন */}
                      {homeoMedications.length > 1 && (
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => removeHomeoMedicationField(index)}
                          className="w-12 h-12 shrink-0 bg-red-50 hover:bg-red-100 dark:bg-red-900/20"
                        >
                          <span className="font-bold text-2xl">&times;</span>
                        </IconButton>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  size="md"
                  variant="outlined"
                  onClick={addHomeoMedicationField}
                  className="rounded-full shadow-sm border-blue-400 text-blue-800 dark:border-blue-300 dark:text-blue-200 self-start text-base"
                >
                  + Add More Medicine
                </Button>
              </div>

              <Textarea
                label="অতিরিক্ত নোট বা পরামর্শ লিখুন... (Optional)"
                value={finalPrescriptionNotes}
                onChange={(e) => setFinalPrescriptionNotes(e.target.value)}
                color="blue-gray"
                className="dark:text-white text-lg"
                labelProps={{ className: "text-base" }}
              />
              <div className="flex justify-end gap-3 mt-2">
                <Button
                  size="md"
                  variant="text"
                  color="red"
                  className="text-base"
                  onClick={() => setShowMedicationForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  color="green"
                  type="submit"
                  className="text-base"
                >
                  Save Prescription
                </Button>
              </div>
            </form>
          </CardBody>
        )}
      </Card>

      {/* Homeo Prescription History */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <Typography
          variant="h5"
          className="p-5 font-bold border-b border-gray-200 dark:border-gray-700"
        >
          Homeo Prescription History
        </Typography>
        <CardBody className="flex flex-col gap-6">
          {homeoPrescriptions.length > 0 ? (
            homeoPrescriptions.map((hp) => (
              <div
                key={hp._id}
                className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50 shadow-sm"
              >
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-300 dark:border-gray-700">
                  <Typography className="font-bold text-xl">
                    Dr. {hp.doctor?.name || "Doctor"}
                  </Typography>
                  <Typography className="opacity-90 text-base font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-1.5 rounded-full">
                    {new Date(hp.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side */}
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                      নির্বাচিত লক্ষণসমূহ:
                    </Typography>
                    <ul className="list-disc list-inside mb-6 text-lg opacity-90 text-gray-800 dark:text-gray-200 leading-relaxed">
                      {hp.selectedSymptoms?.map((symp, i) => (
                        <li key={i} className="mb-2">
                          {symp}
                        </li>
                      ))}
                    </ul>

                    <Typography className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Repertory Result:
                    </Typography>
                    <Typography className="text-xl font-mono bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-gray-900 dark:text-gray-100 border border-blue-200 dark:border-blue-800 leading-relaxed">
                      {hp.repertoryResult}
                    </Typography>
                  </div>

                  {/* Right Side */}
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography className="font-bold text-xl text-green-600 dark:text-green-500 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                      <span className="text-2xl">💊</span> Rx (প্রদত্ত ঔষধ):
                    </Typography>

                    {hp.medicines && hp.medicines.length > 0 ? (
                      <div className="flex flex-col gap-4 mb-6">
                        {hp.medicines.map((med, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
                          >
                            <Typography className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-1">
                              {i + 1}. {med.medicineName}{" "}
                              <span className="text-blue-600 dark:text-blue-400 ml-1">
                                ({med.power})
                              </span>
                            </Typography>
                            {med.instruction && (
                              <Typography className="text-lg opacity-90 mt-2 text-gray-700 dark:text-gray-300 font-medium">
                                👉 নিয়ম: {med.instruction}
                              </Typography>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography className="text-lg opacity-70 mb-6 text-red-500 italic">
                        No medicines explicitly listed in database.
                      </Typography>
                    )}

                    {hp.generalNotes && (
                      <>
                        <Typography className="font-bold text-lg text-blue-700 dark:text-blue-400 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 mt-4">
                          পরামর্শ / নোট:
                        </Typography>
                        <Typography className="text-lg opacity-90 whitespace-pre-line text-gray-800 dark:text-gray-200 leading-relaxed">
                          {hp.generalNotes}
                        </Typography>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Typography className="text-center opacity-70 py-10 text-xl">
              No homeo prescriptions found for this patient.
            </Typography>
          )}
        </CardBody>
      </Card>

      {prescriptions && prescriptions.length > 0 && (
        <PrescriptionsCard
          prescriptions={prescriptions}
          title="Allopathy Prescription History"
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
};

export default PatientProfilePage;
