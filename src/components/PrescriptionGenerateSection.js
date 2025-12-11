// src/components/PrescriptionGenerateSection.js
"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemSuffix,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { EyeIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

const PrescriptionGenerateSection = ({
  user = null,
  patient = null,
  pageType = "doctor", // "doctor" | "patient"
}) => {
  const isDoctor = pageType === "doctor";

  const patientName =
    patient?.user?.name || patient?.name || user?.name || "";
  const age = patient?.age || "";
  const sex = patient?.gender || patient?.user?.gender || "";
  const patientId = patient?._id || patient?.user?._id || "";

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // external builder (শুধু doctor view-তে দেখাবো)
  const href = `https://prescription-lr04.onrender.com/?name=${encodeURIComponent(
    patientName
  )}&age=${encodeURIComponent(age)}&sex=${encodeURIComponent(sex)}`;

  // ====== Fetch files from MongoDB (doctor + patient দুজনের জন্যই common) ======
  const fetchPrescriptionFiles = async () => {
    if (!patientName) return;
    try {
      setLoadingFiles(true);
      const res = await fetch(
        `/api/prescription2?patientName=${encodeURIComponent(patientName)}`
      );
      if (!res.ok) throw new Error("Failed to load prescription files");
      const data = await res.json();
      setFiles(data.files || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchPrescriptionFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientName]);

  // ====== Upload (doctor + patient – দুজনেই পারবে) ======
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!patientId) {
      alert("Patient ID missing. Cannot upload.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientName", patientName || "");
      formData.append("doctorName", user?.name || "");
      formData.append("source", "manual");
      // চাইলে এখানে patientId-ও পাঠাতে পারো
      // formData.append("patientId", patientId || "");

      const res = await fetch("/api/prescription2", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchPrescriptionFiles();
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // ====== Delete (শুধু doctor view) ======
  const handleDelete = async (id) => {
    if (!isDoctor) return;

    const ok = window.confirm("এই প্রেসক্রিপশনটি ডিলিট করতে চান?");
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/prescription2?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    } finally {
      setDeletingId(null);
    }
  };

  // ========= UI =========

  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      {/* Header */}
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Typography
            variant="h6"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            {isDoctor ? "Generate Prescription" : "Prescription Files"}
          </Typography>

          {/* Header actions: Generate (doctor only) + Upload (doctor + patient) */}
          <div className="flex items-center gap-2">
            {/* Doctor-only Generate button */}
            {isDoctor && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!patientName || !age) {
                    e.preventDefault();
                    alert("Patient name or age missing!");
                    return;
                  }
                  if (!patientId) {
                    e.preventDefault();
                    alert("Patient ID missing! Prescription may not be linked.");
                  }
                }}
              >
                <Button size="sm" variant="filled" color="blue-gray">
                  Generate
                </Button>
              </a>
            )}

            {/* Upload button – doctor + patient */}
            <label
              htmlFor="prescription-upload"
              className={`cursor-pointer inline-block text-sm font-medium py-2 px-4 rounded-lg transition-colors 
              ${
                uploading
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-light-text-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary"
              }`}
            >
              {uploading ? "Uploading..." : "Upload New"}
            </label>
            <input
              id="prescription-upload"
              type="file"
              hidden
              accept="application/pdf,image/*"
              disabled={uploading || !patientId}
              onChange={handleUpload}
            />
          </div>
        </div>
      </CardHeader>

      {/* Body – list only (doctor + patient একই ডিজাইন) */}
      <CardBody>
        {loadingFiles ? (
          <div className="flex items-center gap-2 opacity-70">
            <Spinner className="h-4 w-4" />
            <Typography variant="small">Loading prescriptions...</Typography>
          </div>
        ) : files.length === 0 ? (
          <Typography
            variant="small"
            className="p-2 text-center opacity-70"
          >
            No prescription files found.
          </Typography>
        ) : (
          <List>
            {files.map((f, idx) => (
              <ListItem
                key={f._id || idx}
                className="rounded-lg mb-2 bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Typography
                    variant="small"
                    className="font-bold opacity-70"
                  >
                    {idx + 1}.
                  </Typography>
                  <DocumentTextIcon className="h-6 w-6 text-red-500" />
                </div>

                <div className="flex-1 mx-4 truncate">
                  <div className="truncate">
                    {f.fileName || `Prescription-${idx + 1}.pdf`}
                  </div>
                  <div className="text-xs opacity-70">
                    {f.createdAt &&
                      new Date(f.createdAt).toLocaleString("en-GB")}
                    {f.source && (
                      <>
                        {" "}
                        • <span className="italic">Source: {f.source}</span>
                      </>
                    )}
                  </div>
                </div>

                <ListItemSuffix className="flex items-center gap-1">
                  {f.fileUrl && (
                    <a
                      href={f.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton variant="text">
                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </IconButton>
                    </a>
                  )}

                  {/* Doctor-only delete icon */}
                  {isDoctor && f._id && (
                    <IconButton
                      variant="text"
                      onClick={() => handleDelete(f._id)}
                      disabled={deletingId === f._id}
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </IconButton>
                  )}
                </ListItemSuffix>
              </ListItem>
            ))}
          </List>
        )}
      </CardBody>
    </Card>
  );
};

export default PrescriptionGenerateSection;
