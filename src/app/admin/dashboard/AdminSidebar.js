// src/app/admin/dashboard/AdminSidebar.js
"use client";
import { Cog6ToothIcon, HomeIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { Card, IconButton, Typography } from "@material-tailwind/react";

export function AdminSidebar() {
  return (
    <Card className="sticky top-4 h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-dark-card">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="white">
          Admin Panel
        </Typography>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary cursor-pointer">
          <IconButton variant="text" color="white">
            <HomeIcon className="h-6 w-6" />
          </IconButton>
          <Typography color="white">Dashboard</Typography>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/50 cursor-pointer">
          <IconButton variant="text" color="white">
            <UserGroupIcon className="h-6 w-6" />
          </IconButton>
          <Typography color="white">Users</Typography>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/50 cursor-pointer">
          <IconButton variant="text" color="white">
            <Cog6ToothIcon className="h-6 w-6" />
          </IconButton>
          <Typography color="white">Settings</Typography>
        </div>
      </div>
    </Card>
  );
}