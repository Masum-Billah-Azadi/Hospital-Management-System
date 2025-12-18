// src/components/PrescriptionsCard.jsx
"use client";

import {
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Typography,
} from "@material-tailwind/react";

/**
 * PrescriptionsCard
 * - Accepts prescriptions array and renders each prescription.
 * - Shows medications with: name, dosage, price, frequency, instruction, duration.
 * - Shows prescription-level followUp if present.
 * - Calls onViewMedicineDetails with the full medication object (not only name).
 */
const PrescriptionsCard = ({
  prescriptions = [],
  title = "Prescriptions",
  onDownloadPdf = () => {},
  onDeletePrescription = () => {},
  onViewMedicineDetails = () => {},
  emptyText = "No prescriptions yet.",
}) => {
  // safe copy + sort by createdAt desc
  const sorted = Array.isArray(prescriptions)
    ? [...prescriptions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  const renderDuration = (duration) => {
    if (!duration) return null;
    const value = duration.value || "";
    const unit = duration.unit || "";
    if (!value && unit === "continue")
      return (
        <Badge color="blue-gray" size="sm">
          চলবে
        </Badge>
      );
    if (!value) return null;
    // Map unit keys to readable Bangla labels if needed
    const unitMap = {
      day: "দিন",
      week: "সপ্তাহ",
      month: "মাস",
      continue: "চলবে",
    };
    return (
      <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-light-text-secondary dark:text-dark-text-secondary">
        {value} {unitMap[unit] || unit}
      </span>
    );
  };

  return (
    <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Typography
            variant="h6"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
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
                  src={
                    (p.doctorInfo && p.doctorInfo.image) ||
                    "/default-avatar.png"
                  }
                  alt={(p.doctorInfo && p.doctorInfo.name) || "Doctor"}
                  size="sm"
                />
                <div>
                  <Typography
                    variant="small"
                    className="font-bold text-light-text-primary dark:text-dark-text-primary"
                  >
                    Dr.{" "}
                    {(p.doctorInfo && p.doctorInfo.name) || p.doctorName || "—"}
                  </Typography>
                  <Typography
                    variant="small"
                    className="opacity-80 text-light-text-secondary dark:text-dark-text-secondary"
                  >
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : ""}
                    {p.followUp && p.followUp.value ? (
                      <span className="ml-3 text-xs inline-flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
                        {/* Show follow-up compact */}
                        🔁 Follow-up: {p.followUp.value}{" "}
                        {p.followUp.unit === "day"
                          ? "day(s)"
                          : p.followUp.unit === "week"
                          ? "week(s)"
                          : p.followUp.unit === "month"
                          ? "month(s)"
                          : p.followUp.unit}
                      </span>
                    ) : null}
                  </Typography>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  {/* Download PDF */}
                  <IconButton
                    variant="text"
                    onClick={() => onDownloadPdf(p._id)}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </IconButton>

                  {/* Delete Prescription */}
                  <IconButton
                    variant="text"
                    onClick={() => onDeletePrescription(p._id)}
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pl-4">
                {Array.isArray(p.medications) && p.medications.length > 0 ? (
                  p.medications.map((med, index) =>
                    med.medicationName ? (
                      <div
                        key={index}
                        onClick={() =>
                          onViewMedicineDetails({
                            _id: med._id || null,
                            name: med.medicationName,
                          })
                        }
                        className="flex flex-row items-center gap-2 p-2 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Typography
                          variant="small"
                          as="span"
                          className="w-6 font-bold text-light-text-secondary dark:text-dark-text-secondary"
                        >
                          {index + 1}.
                        </Typography>

                        <div className="flex-1">
                          <Typography
                            variant="small"
                            as="div"
                            className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
                          >
                            <strong className="mr-1">
                              {med.medicationName}
                            </strong>
                            {med.dosage && (
                              <span className="opacity-80 text-xs">
                                — {med.dosage}
                              </span>
                            )}
                            {med.price && (
                              <span className="ml-2 opacity-80 text-xs">
                                ({`৳${med.price}`})
                              </span>
                            )}
                          </Typography>

                          <div className="mt-1 flex items-center gap-3">
                            {med.frequency && (
                              <span className="text-xs opacity-80">
                                {med.frequency}
                              </span>
                            )}
                            {med.instruction && (
                              <span className="text-xs opacity-80">
                                · {med.instruction}
                              </span>
                            )}
                            {med.duration ? (
                              <span className="ml-auto">
                                {renderDuration(med.duration)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary opacity-50" />
                      </div>
                    ) : null
                  )
                ) : (
                  <Typography
                    variant="small"
                    className="text-light-text-secondary dark:text-dark-text-secondary"
                  >
                    No medicines listed.
                  </Typography>
                )}
              </div>

              {p.generalNotes && (
                <Typography
                  variant="small"
                  className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-light-text-primary dark:text-dark-text-primary"
                >
                  <strong>Notes:</strong> {p.generalNotes}
                </Typography>
              )}

              {p.suggestedReports && p.suggestedReports.length > 0 && (
                <Typography
                  variant="small"
                  className="mt-2 text-light-text-primary dark:text-dark-text-primary"
                >
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
