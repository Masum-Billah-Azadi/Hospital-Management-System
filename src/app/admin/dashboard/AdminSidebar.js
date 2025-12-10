// src/app/admin/dashboard/AdminSidebar.js
"use client";
import { Card, Typography, IconButton } from "@material-tailwind/react";
import { HomeIcon, UserGroupIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function AdminSidebar() {
  return (
    // পরিবর্তন: থিম-সচেতন ব্যাকগ্রাউন্ড
    <Card className="sticky top-4 h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card">
      <div className="flex flex-col h-full">
        <div>
          <div className="mb-2 p-4">
            {/* পরিবর্তন: থিম-সচেতন টেক্সটের রঙ */}
            <Typography variant="h5" className="text-light-text-primary dark:text-dark-text-primary">
              Admin Panel
            </Typography>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary cursor-pointer text-white">
              <HomeIcon className="h-6 w-6" />
              <Typography>Dashboard</Typography>
            </div>
            {/* পরিবর্তন: থিম-সচেতন টেক্সট এবং আইকনের রঙ */}
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
              <UserGroupIcon className="h-6 w-6" />
              <Typography color="inherit">Users</Typography>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
              <Cog6ToothIcon className="h-6 w-6" />
              <Typography color="inherit">Settings</Typography>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </Card>
  );
}