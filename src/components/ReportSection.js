// src/components/ReportSection.js
"use client";

import {
  DocumentTextIcon,
  EyeIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
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
import { useEffect, useState } from "react";

const ReportSection = ({
  // old props (patient side)
  reports = [],
  isUploading = false,
  handleReportUpload,
  showGenerateButton = false,
  pageType = "patient", // 'doctor' | 'patient' | 'patient-medical'
  user = null,
  patient = null,
}) => {
  // ====== Common values (doctor + patient-medical এর জন্যও লাগবে) ======
  const patientName =
    patient?.user?.name || patient?.name || user?.name || "";
  const patientAge = patient?.age || "";
  const patientGender = patient?.gender || "";

  const isDoctorPage = pageType === "doctor";
  const isDbPage = isDoctorPage || pageType === "patient-medical";

  // ============================================
  //   DOCTOR + PATIENT-MEDICAL VIEW
  //   (MongoDB medical_reports collection)
  // ============================================
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingDoctor, setUploadingDoctor] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReportsFromDB = async () => {
    if (!isDbPage || !patientName) return;

    try {
      setLoadingFiles(true);
      const res = await fetch(
        `/api/report2?patientName=${encodeURIComponent(patientName)}`
      );
      if (!res.ok) throw new Error("Failed to load medical reports");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isDbPage) {
      fetchReportsFromDB();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDbPage, patientName]);

  const handleDoctorUpload = async (e) => {
    if (!isDoctorPage) return; // patient-medical এ যেন trigger না হয়
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoctor(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientName", patientName || "");
      formData.append("doctorName", user?.name || "");

      const res = await fetch("/api/report2", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchReportsFromDB();
      e.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Report upload failed!");
    } finally {
      setUploadingDoctor(false);
    }
  };

  const handleDoctorDelete = async (id) => {
    if (!isDoctorPage || !id) return; // patient-medical এর জন্য নয়
    const ok = window.confirm("Delete this medical report?");
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/report2?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  //   RENDER: DB-based (doctor + patient-medical)
  // ============================================
  if (isDbPage) {
    const generateHref = `https://medical-report-hbnk.onrender.com/?name=${encodeURIComponent(
      patientName || ""
    )}&age=${encodeURIComponent(patientAge || "")}&sex=${encodeURIComponent(
      patientGender || ""
    )}`;

    const title = isDoctorPage ? "Medical Reports" : "Your Medical Reports";

    return (
      <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
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
              {title}
            </Typography>

            <div className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
              {/* শুধু doctor এর জন্য Generate + Upload */}
              {isDoctorPage && showGenerateButton && (
                <a
                  href={generateHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!patientName || !patientAge) {
                      e.preventDefault();
                      alert("Patient name or age missing!");
                    }
                  }}
                >
                  <Button size="sm" variant="filled" color="blue-gray">
                    Generate Report
                  </Button>
                </a>
              )}

              {isDoctorPage && (
                <>
                  <label
                    htmlFor={`report-upload-${pageType}`}
                    className={`cursor-pointer inline-block text-sm font-medium py-2 px-4 rounded-lg transition-colors 
              ${
                uploadingDoctor
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-light-text-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary"
              }`}
                  >
                    {uploadingDoctor ? "Uploading..." : "Upload New"}
                  </label>
                  <input
                    type="file"
                    id={`report-upload-${pageType}`}
                    hidden
                    onChange={handleDoctorUpload}
                    disabled={uploadingDoctor}
                    accept="image/*, application/pdf"
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {loadingFiles ? (
            <div className="flex items-center gap-2 opacity-70">
              <Spinner className="h-4 w-4" />
              <Typography variant="small">
                Loading medical reports...
              </Typography>
            </div>
          ) : files.length === 0 ? (
            <Typography
              variant="small"
              className="p-4 text-center opacity-70"
            >
              No reports found for this patient.
            </Typography>
          ) : (
            <List>
              {files.map((report, index) => (
                <ListItem
                  key={report._id || index}
                  className="rounded-lg mb-2 bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* left side: index + icon */}
                  <div className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      className="font-bold opacity-70"
                    >
                      {index + 1}.
                    </Typography>
                    {report.mimeType === "application/pdf" ||
                    (report.fileName || "").toLowerCase().endsWith(".pdf") ? (
                      <DocumentTextIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <PhotoIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>

                  {/* middle: name + date (exact same vibe as prescription list) */}
                  <div className="flex-1 mx-4 truncate">
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={report.fileName}
                      className="block truncate hover:underline text-light-text-primary dark:text-dark-text-primary"
                    >
                      {report.fileName || `MedicalReport-${index + 1}.pdf`}
                    </a>

                    {report.createdAt && (
                      <span className="block text-xs opacity-70 mt-0.5">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* right: view + (doctor only) delete */}
                  <ListItemSuffix className="flex items-center gap-1">
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton variant="text">
                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </IconButton>
                    </a>

                    {isDoctorPage && (
                      <IconButton
                        variant="text"
                        onClick={() => handleDoctorDelete(report._id)}
                        disabled={deletingId === report._id}
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
  }

  // ============================================
  //   PATIENT পুরোনো version (profile.reports)
  // ============================================
  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
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
            Your Reports
          </Typography>

          <label
            htmlFor={`report-upload-${pageType}`}
            className={`cursor-pointer inline-block text-sm font-medium py-2 px-4 rounded-lg transition-colors 
              ${
                isUploading
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-light-text-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary"
              }`}
          >
            {isUploading ? "Uploading..." : "Upload New"}
          </label>
          <input
            type="file"
            id={`report-upload-${pageType}`}
            hidden
            onChange={handleReportUpload}
            disabled={isUploading}
            accept="image/*, application/pdf"
          />
        </div>
      </CardHeader>

      <CardBody>
        <List>
          {reports && reports.length > 0 ? (
            reports
              .slice()
              .reverse()
              .map((report, index) => (
                <ListItem
                  key={index}
                  className="rounded-lg mb-2 bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      className="font-bold opacity-70"
                    >
                      {index + 1}.
                    </Typography>
                    {report.fileName.endsWith(".pdf") ? (
                      <DocumentTextIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <PhotoIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={report.fileName}
                    className="flex-1 mx-4 truncate hover:underline text-light-text-primary dark:text-dark-text-primary"
                  >
                    {report.fileName}
                  </a>
                  <ListItemSuffix>
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconButton variant="text">
                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </IconButton>
                    </a>
                  </ListItemSuffix>
                </ListItem>
              ))
          ) : (
            <Typography
              variant="small"
              className="p-4 text-center opacity-70"
            >
              No reports uploaded.
            </Typography>
          )}
        </List>
      </CardBody>
    </Card>
  );
};

export default ReportSection;
