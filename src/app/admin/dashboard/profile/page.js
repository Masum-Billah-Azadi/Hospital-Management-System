"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const AdminProfilePage = () => {
  const { data: session, update } = useSession();
  // এডমিনের জন্য শুধু নাম, ইমেইল, ছবি এবং মোবাইল রাখা হয়েছে
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ডাটা নিয়ে আসা
  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch("/api/profile/admin")
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            image: data.image || "",
            mobile: data.mobile || "", // User মডেলে মোবাইল ফিল্ড
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    let imageUrl = formData.image;

    // ছবি আপলোড লজিক (আপনার আগের মতোই)
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
      const profileData = {
        name: formData.name,
        mobile: formData.mobile,
        image: imageUrl,
      };

      const res = await fetch("/api/profile/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Failed to update profile.");

      // সেশন আপডেট করা যাতে হেডার/ন্যাভবারে নতুন ছবি/নাম সাথে সাথে দেখায়
      await update({ name: profileData.name, image: profileData.image });

      setMessage("Admin profile updated successfully!");
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
    <Card className="w-full max-w-4xl mx-auto bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary mt-10">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-light-text-primary dark:text-dark-text-primary">
          <Typography variant="h5" color="inherit">
            Admin Profile Settings
          </Typography>
          <Typography variant="small" color="inherit" className="opacity-70">
            Manage your administrative account details.
          </Typography>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Picture Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center gap-4 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-light-bg dark:bg-dark-bg">
              <Avatar
                src={imagePreview || formData.image || "/default-avatar.png"}
                alt="Admin Profile"
                size="xxl"
                className="border-4 border-white shadow-lg"
              />
              <div className="text-center">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="dark:text-white mb-1"
                >
                  Profile Photo
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-gray-500"
                >
                  JPG, GIF or PNG. Max 1MB.
                </Typography>
              </div>
              <label
                htmlFor="admin-picture-upload"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors shadow-sm"
              >
                Upload New
              </label>
              <input
                type="file"
                id="admin-picture-upload"
                name="image"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            {/* Form Fields Section */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
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
                icon={<i className="fas fa-lock" />}
              />
              <Input
                crossOrigin={""}
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                color="blue-gray"
                className="dark:text-white"
              />

              {/* এডমিনের জন্য role চেঞ্জ করার অপশন সাধারণত থাকে না, তাই দেখানো হলো শুধু */}
              <div className="p-3 bg-blue-50 dark:bg-gray-800 rounded border border-blue-100 dark:border-gray-700">
                <Typography
                  variant="small"
                  className="font-bold text-blue-800 dark:text-blue-200"
                >
                  Role: Administrator
                </Typography>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-center ${message.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
            >
              <Typography variant="small" className="font-bold">
                {message}
              </Typography>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              color="blue"
              className="w-full md:w-auto"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" /> Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default AdminProfilePage;
