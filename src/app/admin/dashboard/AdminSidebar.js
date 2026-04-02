// src/app/admin/dashboard/AdminSidebar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Cog6ToothIcon,
  HomeIcon,
  ReceiptRefundIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Card, Typography } from "@material-tailwind/react";
import Link from "next/link";

export function AdminSidebar() {
  return (
    <Card className="sticky top-4 h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card">
      <div className="flex flex-col h-full">
        <div>
          <div className="mb-2 p-4">
            <Typography
              variant="h5"
              className="text-light-text-primary dark:text-dark-text-primary"
            >
              Admin Panel
            </Typography>
          </div>
          <div className="flex flex-col gap-4">
            {/* ✅ Dashboard Link ঠিক করা হলো */}
            <Link href="/admin/dashboard">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
                <HomeIcon className="h-6 w-6" />
                <Typography>Dashboard</Typography>
              </div>
            </Link>

            {/* Users Link */}
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
              <UserGroupIcon className="h-6 w-6" />
              <Typography color="inherit">Users</Typography>
            </div>

            {/* Profile Link */}
            <Link href="/admin/dashboard/profile">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
                <UserCircleIcon className="h-6 w-6" />
                <Typography color="inherit">My Profile</Typography>
              </div>
            </Link>

            {/* Refunds Link */}
            <Link href="/admin/dashboard/refunds">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/20 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary">
                <ReceiptRefundIcon className="h-6 w-6" />
                <Typography color="inherit">Refunds</Typography>
              </div>
            </Link>
            <Link
              href="/dashboard/homeo-repertory"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-lg font-medium"
            >
              <span>⚕️</span>
              <span>Homeo Repertory</span>
            </Link>

            {/* Settings Link */}
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
