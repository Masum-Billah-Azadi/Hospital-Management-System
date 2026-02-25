// src/app/admin/dashboard/page.js
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
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { AdminProfile } from "./AdminProfile";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dateA = a.createdAt
      ? new Date(a.createdAt).getTime()
      : parseInt(a._id.substring(0, 8), 16);
    const dateB = b.createdAt
      ? new Date(b.createdAt).getTime()
      : parseInt(b._id.substring(0, 8), 16);
    return dateB - dateA;
  });

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentUsers = filteredUsers.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)]">
      <div className="flex flex-col flex-1 min-w-0 w-full h-full">
        <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Typography
            variant="h4"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            User Management
          </Typography>
          <div className="w-full sm:w-72">
            <Input
              label="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-black dark:text-white !border-t-transparent focus:!border-t-transparent dark:focus:!border-t-transparent"
              labelProps={{
                className:
                  "text-gray-500 dark:text-gray-400 peer-focus:text-gray-900 dark:peer-focus:text-white before:border-gray-300 dark:before:border-gray-700 after:border-gray-300 dark:after:border-gray-700 peer-focus:before:!border-gray-900 dark:peer-focus:before:!border-white peer-focus:after:!border-gray-900 dark:peer-focus:after:!border-white",
              }}
            />
          </div>
        </div>

        <Card className="flex flex-col flex-1 min-h-0 w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border border-gray-200 dark:border-gray-800">
          <CardHeader
            floated={false}
            shadow={false}
            className="shrink-0 rounded-none bg-transparent mb-0 z-10"
          >
            <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-300 dark:border-blue-gray-100/20 bg-gray-50 dark:bg-gray-800/50">
              <Typography
                variant="small"
                className="flex-1 font-bold opacity-70 uppercase text-light-text-primary dark:text-dark-text-primary"
              >
                User Info
              </Typography>
              <Typography
                variant="small"
                className="w-48 text-center font-bold opacity-70 uppercase text-light-text-primary dark:text-dark-text-primary"
              >
                Current Role
              </Typography>
              <Typography
                variant="small"
                className="w-48 text-center font-bold opacity-70 uppercase text-light-text-primary dark:text-dark-text-primary"
              >
                Change Role
              </Typography>
            </div>
          </CardHeader>

          {/* ১. কাস্টম এবং মডার্ন স্ক্রলবার ডিজাইন যুক্ত করা হলো */}
          <CardBody className="flex-1 overflow-y-auto p-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 transition-colors">
            {loading ? (
              <div className="flex justify-center p-10">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="min-w-max md:min-w-0">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <Avatar
                          src={
                            user.image ||
                            `https://ui-avatars.com/api/?name=${user.name?.replace(/\s/g, "+")}`
                          }
                          alt={user.name}
                        />
                        <div>
                          <Typography
                            variant="small"
                            color="inherit"
                            className="font-bold"
                          >
                            {user.name}
                          </Typography>
                          <Typography
                            variant="small"
                            color="inherit"
                            className="opacity-80 text-xs"
                          >
                            {user.email}
                          </Typography>
                        </div>
                      </div>

                      <div className="w-full md:w-48 text-left md:text-center flex items-center gap-2 md:justify-center">
                        <Typography
                          variant="small"
                          className="md:hidden font-bold opacity-70"
                        >
                          Current Role:
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue"
                          className="font-bold uppercase text-xs"
                        >
                          {user.role}
                        </Typography>
                      </div>

                      <div className="w-full md:w-48">
                        <Select
                          label="Change Role"
                          value={user.role}
                          onChange={(newRole) =>
                            handleRoleChange(user._id, newRole)
                          }
                          className="text-light-text-primary dark:text-dark-text-primary !border-t-transparent focus:!border-t-transparent dark:focus:!border-t-transparent"
                          labelProps={{
                            className:
                              "text-gray-500 dark:text-gray-400 peer-focus:text-gray-900 dark:peer-focus:text-white before:border-gray-300 dark:before:border-gray-700 after:border-gray-300 dark:after:border-gray-700 peer-focus:before:!border-gray-900 dark:peer-focus:before:!border-white peer-focus:after:!border-gray-900 dark:peer-focus:after:!border-white",
                          }}
                          menuProps={{
                            className:
                              "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border-gray-300 dark:border-gray-700",
                          }}
                        >
                          <Option value="patient">Patient</Option>
                          <Option value="doctor">Doctor</Option>
                          <Option value="admin">Admin</Option>
                        </Select>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center opacity-70">
                    No users found.
                  </div>
                )}
              </div>
            )}
          </CardBody>

          {!loading && visibleCount < filteredUsers.length && (
            <div className="shrink-0 flex justify-center p-4 border-t border-gray-200 dark:border-gray-700 bg-light-card dark:bg-dark-card rounded-b-xl">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800"
              >
                View More ({filteredUsers.length - visibleCount} left)
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ২. Profile এর হাইট ফিক্স করা হলো (h-fit) */}
      <div className="hidden xl:block w-80 shrink-0 h-fit rounded-xl">
        <AdminProfile />
      </div>
    </div>
  );
};

export default AdminDashboard;
