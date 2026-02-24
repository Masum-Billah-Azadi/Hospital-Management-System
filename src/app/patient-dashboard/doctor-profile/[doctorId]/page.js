"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const DoctorProfileView = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const { doctorId } = params;

  useEffect(() => {
    if (doctorId) {
      const fetchDoctorDetails = async () => {
        try {
          const res = await fetch(`/api/doctors/${doctorId}`);
          if (!res.ok) throw new Error("Doctor not found");
          const data = await res.json();
          setDoctor(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctorDetails();
    }
  }, [doctorId]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Spinner className="h-12 w-12" />
      </div>
    );
  if (!doctor)
    return (
      <Typography color="red" className="p-10 text-center">
        {error || "Doctor not found."}
      </Typography>
    );

  return (
    <div className="min-h-screen p-4 bg-light-bg dark:bg-dark-bg">
      <Card className="w-full max-w-3xl mx-auto mt-10 bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardBody className="flex flex-col items-center text-center gap-4 p-8">
          <Avatar
            src={doctor.user?.image || "/default-avatar.png"}
            alt={`Dr. ${doctor.user?.name}`}
            size="xxl"
            className="border-4 border-blue-500 shadow-lg"
          />

          <div>
            <Typography variant="h3" className="font-bold">
              Dr. {doctor.user?.name}
            </Typography>
            <Typography variant="h5" color="blue" className="mt-1">
              {doctor.designation}
            </Typography>
          </div>

          <div className="w-full text-left mt-6 p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <Typography
              variant="h6"
              className="font-bold border-b border-gray-300 pb-2 mb-4"
            >
              About Doctor / Biodata
            </Typography>
            <Typography className="whitespace-pre-wrap">
              {doctor.bio ? doctor.bio : "Biodata not updated yet."}
            </Typography>
          </div>

          <div className="w-full text-left p-6">
            <Typography className="font-bold mb-2">Chamber Address:</Typography>
            <Typography>{doctor.address || "N/A"}</Typography>

            <Typography className="font-bold mt-4 mb-2">
              Consultation Fee:
            </Typography>
            <Typography>৳ {doctor.fees || 500}</Typography>
          </div>

          {doctor.isAvailable === false ? (
            <Button
              color="gray"
              fullWidth
              disabled
              className="mt-4 cursor-not-allowed"
            >
              Doctor is Currently Not Available
            </Button>
          ) : (
            <Link
              href={`/patient-dashboard/book-appointment/${doctor.user?._id || doctorId}`}
              className="w-full mt-4"
            >
              <Button color="green" fullWidth>
                Book Appointment Now
              </Button>
            </Link>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DoctorProfileView;
