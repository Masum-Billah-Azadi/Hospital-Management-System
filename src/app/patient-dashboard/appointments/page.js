// src/app/patient-dashboard/appointments/page.js
"use client";

import {
  Avatar,
  Card,
  CardBody,
  Chip,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments/patient");
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

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
      <div className="flex justify-center p-10">
        <Spinner className="h-12 w-12" />
      </div>
    );

  // নতুন অ্যাপয়েন্টমেন্ট সবার উপরে রাখার জন্য সর্ট করা হচ্ছে
  const sortedAppointments = [...appointments].sort((a, b) => {
    return (
      new Date(b.createdAt || b.appointmentDate) -
      new Date(a.createdAt || a.appointmentDate)
    );
  });

  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardBody>
        <Typography
          variant="h5"
          color="inherit"
          className="mb-6 text-light-text-primary dark:text-dark-text-primary"
        >
          My Appointments
        </Typography>
        <div className="flex flex-col gap-4">
          {sortedAppointments.length > 0 ? (
            sortedAppointments.map((app) => (
              <Card
                key={app._id}
                className="p-4 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <Avatar
                      src={
                        app.doctor?.image ||
                        `https://ui-avatars.com/api/?name=${app.doctor?.name.replace(/\s/g, "+")}`
                      }
                      alt={`Dr. ${app.doctor?.name}`}
                    />
                    <div>
                      <Typography
                        variant="h6"
                        className="text-light-text-primary dark:text-dark-text-primary"
                      >
                        Dr. {app.doctor?.name}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-light-text-secondary dark:text-dark-text-secondary"
                      >
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    value={app.status}
                    color={getStatusChipColor(app.status)}
                    className="capitalize"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <Typography
                    variant="small"
                    className="text-light-text-primary dark:text-dark-text-primary"
                  >
                    <strong>Reason:</strong> {app.reason}
                  </Typography>

                  {/* টাইম স্লট দেখানোর ব্যবস্থা করা হলো */}
                  <Typography
                    variant="small"
                    color="blue"
                    className="font-bold mt-1"
                  >
                    <strong>Time Slot:</strong>{" "}
                    {app.timeSlot ||
                      app.scheduledTime ||
                      "Pending Confirmation"}
                  </Typography>
                </div>
              </Card>
            ))
          ) : (
            <Typography className="text-center p-10 opacity-70">
              You have no appointments.
            </Typography>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MyAppointmentsPage;
