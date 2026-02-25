// src/app/dashboard/appointments/page.js
"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TABLE_HEAD = [
  "Patient Info",
  "Date & Time",
  "Reason",
  "Status",
  "Actions",
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments/doctor");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAddPatientSilent = async (patientId) => {
    try {
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
    } catch (err) {
      console.error("Auto-add patient error:", err);
    }
  };

  const handleUpdateStatus = async (
    appointmentId,
    status,
    patientId = null,
  ) => {
    try {
      const res = await fetch("/api/appointments/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      if (status === "accepted" && patientId) {
        await handleAddPatientSilent(patientId);
      }

      if (status === "rejected") {
        setAppointments((prev) =>
          prev.filter((app) => app._id !== appointmentId),
        );
      } else {
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === appointmentId ? { ...app, status } : app,
          ),
        );
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case "pending":
        return "amber";
      case "accepted":
        return "green";
      case "rejected":
        return "red";
      default:
        return "blue-gray";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-12 w-12" />
      </div>
    );
  if (error) return <Typography color="red">Error: {error}</Typography>;

  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent mb-2"
      >
        <div className="px-4 pt-4 pb-2">
          <Typography
            variant="h5"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            My Appointments
          </Typography>
        </div>
      </CardHeader>

      {/* overflow-x-auto আছে, তবে min-w-max সরিয়ে দেওয়া হয়েছে যাতে স্ক্রলবার না আসে */}
      <CardBody className="p-0 overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  // প্যাডিং কমানো হয়েছে (px-2 sm:px-3)
                  className="border-b border-blue-gray-100 dark:border-gray-700 bg-blue-gray-50 dark:bg-gray-800/50 py-2 px-2 sm:px-3"
                >
                  <Typography
                    variant="small"
                    className="font-bold leading-none opacity-70 text-[11px] sm:text-xs"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((app, index) => {
                const isLast = index === appointments.length - 1;
                // প্যাডিং কমানো হয়েছে
                const classes = isLast
                  ? "py-2 px-2 sm:px-3"
                  : "py-2 px-2 sm:px-3 border-b border-blue-gray-50 dark:border-gray-700";

                return (
                  <tr
                    key={app._id}
                    className="hover:bg-blue-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className={classes}>
                      <Tooltip content={app.patient?.name} placement="top">
                        <Link
                          href={`/dashboard/patients/${app.patient?._id}`}
                          className="flex items-center gap-2 w-max cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <Avatar
                            src={
                              app.patient?.image ||
                              `https://ui-avatars.com/api/?name=${app.patient?.name.replace(/\s/g, "+")}`
                            }
                            alt={app.patient?.name}
                            size="sm"
                            className="w-7 h-7 sm:w-8 sm:h-8"
                          />
                          <Typography
                            variant="small"
                            color="inherit"
                            className="font-semibold max-w-[80px] sm:max-w-[110px] truncate text-xs sm:text-sm"
                          >
                            {app.patient?.name}
                          </Typography>
                        </Link>
                      </Tooltip>
                    </td>
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="inherit"
                          className="font-normal text-xs"
                        >
                          {new Date(app.appointmentDate).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue"
                          className="font-bold mt-0.5 text-[10px] sm:text-xs"
                        >
                          {app.timeSlot || app.scheduledTime || "Time Not Set"}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Tooltip content={app.reason} placement="top">
                        <Typography
                          variant="small"
                          color="inherit"
                          className="font-normal max-w-[80px] sm:max-w-[120px] truncate cursor-help text-xs sm:text-sm"
                        >
                          {app.reason}
                        </Typography>
                      </Tooltip>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          value={app.status}
                          color={getStatusChipColor(app.status)}
                          className="py-0.5 px-2 text-[9px] sm:text-[10px]"
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex gap-1.5 sm:gap-2 items-center">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              color="green"
                              className="py-1 px-2 text-[10px]"
                              onClick={() =>
                                handleUpdateStatus(
                                  app._id,
                                  "accepted",
                                  app.patient?._id,
                                )
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outlined"
                              color="red"
                              className="py-1 px-2 text-[10px]"
                              onClick={() =>
                                handleUpdateStatus(app._id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === "accepted" && (
                          <Typography
                            variant="small"
                            color="green"
                            className="font-medium italic text-[10px] sm:text-xs"
                          >
                            Confirmed
                          </Typography>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Typography className="opacity-80">
                    No appointments found.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default AppointmentsPage;
