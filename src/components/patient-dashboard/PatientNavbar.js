// src/components/patient-dashboard/PatientNavbar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Bars3Icon,
  CalendarDaysIcon,
  HeartIcon,
  HomeIcon,
  PowerIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Navbar,
  Typography,
} from "@material-tailwind/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function PatientNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Navbar className="w-full p-2 lg:hidden bg-light-card dark:bg-dark-card border-none text-light-text-primary dark:text-dark-text-primary">
      <div className="relative mx-auto flex items-center justify-between">
        <Typography
          onClick={() => router.push("/patient-dashboard")}
          variant="h6"
          color="inherit"
          className="cursor-pointer"
        >
          Patient Portal
        </Typography>
        <Menu>
          <MenuHandler>
            <IconButton variant="text" color="inherit">
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          </MenuHandler>
          <MenuList className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border-gray-300 dark:border-gray-700">
            <MenuItem className="flex items-center gap-2">
              <Avatar
                size="sm"
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name || "Patient"}
              />
              <Typography
                variant="small"
                color="inherit"
                className="font-medium"
              >
                {session?.user?.name}
              </Typography>
            </MenuItem>
            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />

            <MenuItem
              onClick={() => router.push("/patient-dashboard")}
              className="flex items-center gap-2"
            >
              <HomeIcon className="h-4 w-4" /> Dashboard
            </MenuItem>
            <MenuItem
              onClick={() => router.push("/patient-dashboard/doctors")}
              className="flex items-center gap-2"
            >
              <UserGroupIcon className="h-4 w-4" /> Find a Doctor
            </MenuItem>
            <MenuItem
              onClick={() => router.push("/patient-dashboard/appointments")}
              className="flex items-center gap-2"
            >
              <CalendarDaysIcon className="h-4 w-4" /> My Appointments
            </MenuItem>

            <MenuItem
              onClick={() => router.push("/patient-dashboard/profile")}
              className="flex items-center gap-2"
            >
              <UserCircleIcon className="h-4 w-4" /> My Profile
            </MenuItem>

            {/* Blood Bank */}
            <MenuItem
              onClick={() =>
                window.open("http://anirban.lovestoblog.com/", "_blank")
              }
              className="flex items-center gap-2"
            >
              <HeartIcon className="h-4 w-4" /> Blood Bank
            </MenuItem>

            {/* 🔹 নতুন Northern Pharmacy লিংক */}
            <MenuItem
              onClick={() =>
                window.open("https://northern-pharmacy.vercel.app/", "_blank")
              }
              className="flex items-center gap-2"
            >
              <HomeIcon className="h-4 w-4" /> Northern Pharmacy
            </MenuItem>

            <MenuItem
              onClick={() =>
                window.open(
                  "https://northern-ambulance.infinityfreeapp.com/",
                  "_blank",
                )
              }
              className="flex items-center gap-2"
            >
              <TruckIcon className="h-4 w-4" /> Northern Ambulance
            </MenuItem>

            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />
            <MenuItem>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Typography variant="small">Change Theme</Typography>
              </div>
            </MenuItem>
            <MenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-red-500"
            >
              <PowerIcon className="h-4 w-4" /> Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Navbar>
  );
}
