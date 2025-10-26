// src/components/PrescriptionsCard.jsx
"use client";

import React from "react";
import { ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Typography,
} from "@material-tailwind/react";

const PrescriptionsCard = ({
  prescriptions = [],
  title = "Prescriptions",
  onDownloadPdf = () => {},
  onViewMedicineDetails = () => {},
  emptyText = "No prescriptions yet.",
}) => {
  // safe copy + sort by createdAt desc
  const sorted = Array.isArray(prescriptions)
    ? [...prescriptions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  return (
    <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">
            {title}
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col gap-4 p-4">
        {sorted.length === 0 ? (
          <Typography variant="small" className="text-center">
            {emptyText}
          </Typography>
        ) : (
          sorted.map((p) => (
            <Card key={p._id} className="p-4 bg-light-bg dark:bg-dark-bg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src={(p.doctorInfo && p.doctorInfo.image) || "/default-avatar.png"}
                  alt={(p.doctorInfo && p.doctorInfo.name) || "Doctor"}
                  size="sm"
                />
                <div>
                  <Typography variant="small" className="font-bold text-light-text-primary dark:text-dark-text-primary">
                    Dr. {(p.doctorInfo && p.doctorInfo.name) || p.doctorName || "—"}
                  </Typography>
                  <Typography variant="small" className="opacity-80 text-light-text-secondary dark:text-dark-text-secondary">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                  </Typography>
                </div>

                <div className="ml-auto">
                  <IconButton variant="text" onClick={() => onDownloadPdf(p._id)}>
                    <ArrowDownTrayIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pl-4">
                {Array.isArray(p.medications) && p.medications.length > 0 ? (
                  p.medications.map((med, index) =>
                    med.medicationName ? (
                      <div
                        key={index}
                        onClick={() => onViewMedicineDetails(med.medicationName)}
                        className="flex flex-row items-center gap-2 p-2 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Typography variant="small" as="span" className="w-6 font-bold text-light-text-secondary dark:text-dark-text-secondary">
                          {index + 1}.
                        </Typography>

                        <Typography variant="small" as="div" className="flex-1 text-light-text-primary dark:text-dark-text-primary">
                          <strong>{med.medicationName}</strong>
                          {med.dosage && ` - ${med.dosage}`}
                          {med.frequency && `, ${med.frequency}`}
                          {med.instruction && ` (${med.instruction})`}
                        </Typography>

                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary opacity-50" />
                      </div>
                    ) : null
                  )
                ) : (
                  <Typography variant="small" className="text-light-text-secondary dark:text-dark-text-secondary">No medicines listed.</Typography>
                )}
              </div>

              {p.generalNotes && (
                <Typography variant="small" className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-light-text-primary dark:text-dark-text-primary">
                  <strong>Notes:</strong> {p.generalNotes}
                </Typography>
              )}

              {p.suggestedReports && p.suggestedReports.length > 0 && (
                <Typography variant="small" className="mt-2 text-light-text-primary dark:text-dark-text-primary">
                  <strong>Tests:</strong> {p.suggestedReports.join(", ")}
                </Typography>
              )}
            </Card>
          ))
        )}
      </CardBody>
    </Card>
  );
};

export default PrescriptionsCard;
