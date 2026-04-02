"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MyPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();

        // লেটেস্ট পেশেন্টকে সবার উপরে রাখার জন্য Sort
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setPatients(sortedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchName = patient.user?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchPhone = patient.phone?.includes(searchQuery);
    return matchName || matchPhone;
  });

  const handleSavePatient = async () => {
    if (!newPatient.name || !newPatient.phone) {
      alert("Name and Phone are required!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/patients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!res.ok) throw new Error("Failed to create patient");

      const savedPatient = await res.json();

      // নতুন পেশেন্টকে লিস্টের শুরুতে যুক্ত করা হচ্ছে
      setPatients([savedPatient, ...patients]);

      setNewPatient({ name: "", phone: "", address: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error adding new patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-12 w-12" />
      </div>
    );

  // নতুন পেশেন্টের সম্ভাব্য সিরিয়াল নাম্বার (মোট পেশেন্ট + ১)
  const nextSerialNumber = patients.length + 1;

  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-4">
          <Typography
            variant="h5"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            My Patient List
          </Typography>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <Input
                label="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!text-black dark:!text-white focus:!border-black dark:focus:!border-white"
                labelProps={{
                  className:
                    "!text-gray-700 dark:!text-gray-300 peer-focus:!text-black peer-focus:dark:!text-white",
                }}
              />
            </div>
            <Button
              color="blue"
              className="flex items-center justify-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Add New Patient</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0 overflow-x-auto">
        {/* 🌟 ক্লিন ও বড় ফ্রন্টের টেবিল হেডার */}
        <div className="hidden md:flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 min-w-max">
          <Typography className="font-bold w-16 text-center opacity-70 text-base">
            SL
          </Typography>
          <Typography className="font-bold flex-[2] opacity-70 text-base">
            Patient Name
          </Typography>
          <Typography className="font-bold flex-[2] opacity-70 text-base">
            Address
          </Typography>
        </div>

        <div className="min-w-max md:min-w-0">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patientProfile, index) => (
              <div
                key={patientProfile._id}
                className="flex flex-col md:flex-row items-start md:items-center p-5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* 🌟 ফিক্সড সিরিয়াল নাম্বার */}
                <div className="hidden md:block w-16 text-center">
                  <Typography className="font-bold opacity-80 text-lg text-blue-600 dark:text-blue-400">
                    {patientProfile.serialNumber || patients.length - index}
                  </Typography>
                </div>

                {/* 🌟 ক্লিকেবল নাম ও ছবি (বড় ফ্রন্ট) */}
                <div className="flex items-center gap-4 mb-2 md:mb-0 flex-[2] w-full">
                  <Typography className="md:hidden font-bold opacity-80 w-8 text-lg text-blue-600 dark:text-blue-400">
                    {patientProfile.serialNumber || patients.length - index}.
                  </Typography>

                  <Link
                    href={`/dashboard/patients/${patientProfile.user?._id}`}
                    className="flex items-center gap-4 group cursor-pointer w-full"
                  >
                    <Avatar
                      src={
                        patientProfile.user?.image ||
                        `https://ui-avatars.com/api/?name=${patientProfile.user?.name?.replace(/\s/g, "+")}`
                      }
                      alt={patientProfile.user?.name || "Patient"}
                      size="md"
                      className="group-hover:ring-2 ring-blue-500 transition-all"
                    />
                    <Typography
                      color="inherit"
                      className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {patientProfile.user?.name}
                    </Typography>
                  </Link>
                </div>

                {/* 🌟 Address (বড় ফ্রন্ট) */}
                <div className="mb-2 md:mb-0 flex-[2] w-full flex md:block items-center gap-2">
                  <Typography className="md:hidden font-bold opacity-70 text-base">
                    Address:
                  </Typography>
                  <Typography
                    color="inherit"
                    className="truncate text-base opacity-90"
                  >
                    {patientProfile.address || "N/A"}
                  </Typography>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-10">
              <Typography className="opacity-80 text-lg">
                No patients found.
              </Typography>
            </div>
          )}
        </div>
      </CardBody>

      {/* 🌟 Add New Patient Modal (উন্নত ডিজাইন ও সিরিয়াল শো) */}
      <Dialog
        open={isModalOpen}
        handler={() => setIsModalOpen(false)}
        className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary"
      >
        <DialogHeader className="flex justify-between items-center">
          <span>Add New Patient</span>
          <span className="text-sm font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full">
            Serial: {nextSerialNumber}
          </span>
        </DialogHeader>
        <DialogBody
          divider
          className="flex flex-col gap-5 border-gray-300 dark:border-gray-700"
        >
          <Input
            label="Patient Name *"
            value={newPatient.name}
            onChange={(e) =>
              setNewPatient({ ...newPatient, name: e.target.value })
            }
            color="blue"
            className="dark:text-white text-base"
          />
          <Input
            label="Mobile Number *"
            value={newPatient.phone}
            onChange={(e) =>
              setNewPatient({ ...newPatient, phone: e.target.value })
            }
            color="blue"
            className="dark:text-white text-base"
          />
          <Input
            label="Address"
            value={newPatient.address}
            onChange={(e) =>
              setNewPatient({ ...newPatient, address: e.target.value })
            }
            color="blue"
            className="dark:text-white text-base"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsModalOpen(false)}
            className="mr-2 text-base"
          >
            Cancel
          </Button>
          <Button
            color="green"
            onClick={handleSavePatient}
            disabled={isSubmitting}
            className="text-base"
          >
            {isSubmitting ? "Saving..." : "Save Patient"}
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
};

export default MyPatientsPage;
