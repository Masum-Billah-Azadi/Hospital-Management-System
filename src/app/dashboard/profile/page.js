"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Option,
  Select,
  Spinner,
  Switch,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const specialties = [
  "MEDICINE",
  "OBSTETRICS & GYNECOLOGY",
  "PAEDIATRIC MEDICINE",
  "GENERAL & LAPAROSCOPIC SURGERY",
  "ORTHOPEDICS",
  "CARDIOLOGY",
  "ENT",
  "NEURO MEDICINE",
  "RADIOLOGY & IMAGING",
  "ONCOLOGY",
];

const ProfilePage = () => {
  const { data: session, update } = useSession();
  // স্টেটে availableSlots এবং isAvailable যোগ করা হয়েছে
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    phone: "",
    designation: "",
    address: "",
    bio: "",
    isAvailable: true,
    availableSlots: [],
  });
  const [newSlotTime, setNewSlotTime] = useState(""); // নতুন স্লট ইনপুটের জন্য স্টেট
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch("/api/profile/doctor")
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            image: data.image || "",
            phone: data.phone || "",
            designation: data.designation || "",
            address: data.address || "",
            bio: data.bio || "",
            isAvailable:
              data.isAvailable !== undefined ? data.isAvailable : true,
            availableSlots: data.availableSlots || [],
          });
          setLoading(false);
        });
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 24-hour টাইমকে 12-hour AM/PM ফরম্যাটে রূপান্তর করার ফাংশন
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    const hourFormatted = hour < 10 ? "0" + hour : hour;
    return `${hourFormatted}:${minute} ${ampm}`;
  };

  const handleAddSlot = () => {
    if (newSlotTime) {
      const formattedTime = formatTime(newSlotTime);
      if (!formData.availableSlots.includes(formattedTime)) {
        setFormData((prev) => ({
          ...prev,
          availableSlots: [...prev.availableSlots, formattedTime],
        }));
      }
      setNewSlotTime(""); // ইনপুট ক্লিয়ার করা
    }
  };

  const handleRemoveSlot = (slotToRemove) => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.filter(
        (slot) => slot !== slotToRemove,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    let imageUrl = formData.image;

    if (selectedFile) {
      try {
        const data = new FormData();
        data.set("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image.");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      } catch (error) {
        setMessage("Error uploading image: " + error.message);
        setIsSaving(false);
        return;
      }
    }

    try {
      const profileData = { ...formData, image: imageUrl };
      const res = await fetch("/api/profile/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to update profile.");
      await update({ name: profileData.name, image: profileData.image });
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="h-12 w-12" />
      </div>
    );

  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-light-text-primary dark:text-dark-text-primary">
          <Typography variant="h5" color="inherit">
            Edit Your Profile
          </Typography>
          <Typography variant="small" color="inherit" className="opacity-70">
            Keep your professional information and schedules up to date.
          </Typography>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Form Fields */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <Input
                crossOrigin={""}
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                color="blue-gray"
                className="dark:text-white"
              />
              <Input
                crossOrigin={""}
                label="Email Address"
                name="email"
                value={formData.email}
                disabled
                color="blue-gray"
              />
              <Input
                crossOrigin={""}
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                color="blue-gray"
                className="dark:text-white"
              />
            </div>
            {/* Right Column: Profile Picture */}
            <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-light-bg dark:bg-dark-bg">
              <Typography variant="small" className="font-bold">
                Profile Picture
              </Typography>
              <Avatar
                src={imagePreview || formData.image || `/default-avatar.png`}
                alt="Profile Preview"
                size="xxl"
              />
              <label
                htmlFor="profile-picture-upload"
                className="cursor-pointer inline-block text-sm font-bold py-2 px-4 rounded-lg border text-light-text-primary border-blue-gray-500 dark:text-dark-text-primary hover:bg-blue-gray-50 transition-colors"
              >
                Change Picture
              </label>
              <input
                type="file"
                id="profile-picture-upload"
                name="image"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>

          <Select
            label="Select Designation"
            name="designation"
            value={formData.designation}
            onChange={(value) =>
              handleInputChange({ target: { name: "designation", value } })
            }
            className="dark:text-white"
            menuProps={{
              className:
                "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary",
            }}
          >
            {specialties.map((specialty) => (
              <Option key={specialty} value={specialty}>
                {specialty}
              </Option>
            ))}
          </Select>

          <Textarea
            label="Address / Chamber Location"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            color="blue-gray"
            className="dark:text-white"
          />

          <Textarea
            label="About Me / Biodata (Education, Experience etc.)"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            color="blue-gray"
            className="dark:text-white"
            rows={4}
          />

          {/* --- Time Slots Manager Section --- */}
          <div className="flex flex-col gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
            <div>
              <Typography
                variant="h6"
                color="blue-gray"
                className="dark:text-white"
              >
                Manage Daily Time Slots
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="dark:text-gray-400"
              >
                Add the exact times you want patients to book appointments.
              </Typography>
            </div>

            <div className="flex gap-2 items-center max-w-sm">
              <Input
                crossOrigin={""}
                type="time"
                label="Select Time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                color="blue-gray"
                className="dark:text-white"
              />
              <Button
                onClick={handleAddSlot}
                color="blue"
                disabled={!newSlotTime}
                className="shrink-0"
              >
                Add Slot
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[60px] items-center">
              {formData.availableSlots.length > 0 ? (
                formData.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-red-500 hover:text-red-700 ml-1 text-lg leading-none outline-none"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <Typography variant="small" color="red">
                  No time slots added. Patients won&apos;t be able to book you!
                </Typography>
              )}
            </div>
          </div>
          {/* ---------------------------------- */}

          {/* --- Availability Switch --- */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Switch
              id="availability-switch"
              color="green"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isAvailable: e.target.checked,
                }))
              }
            />
            <div>
              <Typography
                color="blue-gray"
                className="font-bold dark:text-white"
              >
                {formData.isAvailable
                  ? "Currently Available for Appointments"
                  : "Not Available for Appointments"}
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="font-normal dark:text-gray-400"
              >
                Turn this off if you are on leave. It will hide the booking
                button.
              </Typography>
            </div>
          </div>

          {message && (
            <Typography
              color={message.startsWith("Error") ? "red" : "green"}
              className="text-center font-bold"
            >
              {message}
            </Typography>
          )}

          <Button type="submit" color="blue" fullWidth disabled={isSaving}>
            {isSaving ? (
              <Spinner className="h-4 w-4 mx-auto" />
            ) : (
              "Save All Changes"
            )}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default ProfilePage;
