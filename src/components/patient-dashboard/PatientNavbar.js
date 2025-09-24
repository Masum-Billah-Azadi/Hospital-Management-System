// src/components/patient-dashboard/PatientNavbar.js
"use client";
import { Navbar, Typography, IconButton, Menu, MenuHandler, MenuList, MenuItem, Avatar } from "@material-tailwind/react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // পরিবর্তন: useRouter ইম্পোর্ট করুন
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Bars3Icon, PowerIcon, HomeIcon, UserGroupIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";

export function PatientNavbar() {
  const { data: session } = useSession();
  const router = useRouter(); // পরিবর্তন: useRouter হুক ব্যবহার করুন

  return (
    <Navbar className="w-full p-2 lg:hidden bg-light-card dark:bg-dark-card border-none text-light-text-primary dark:text-dark-text-primary">
      <div className="relative mx-auto flex items-center justify-between">
        <Typography onClick={() => router.push('/patient-dashboard')} variant="h6" color="inherit" className="cursor-pointer">
          Patient Portal
        </Typography>
        <Menu>
          <MenuHandler>
            <IconButton variant="text" color="inherit"><Bars3Icon className="h-6 w-6" /></IconButton>
          </MenuHandler>
          <MenuList className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border-gray-300 dark:border-gray-700">
            <MenuItem className="flex items-center gap-2">
              <Avatar size="sm" src={session?.user?.image || "/default-avatar.png"} alt={session?.user?.name || "Patient"} />
              <Typography variant="small" color="inherit" className="font-medium">{session?.user?.name}</Typography>
            </MenuItem>
            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />
            
            {/* পরিবর্তন: as={Link} এর পরিবর্তে onClick ব্যবহার করা হয়েছে */}
            <MenuItem onClick={() => router.push('/patient-dashboard')} className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => router.push('/patient-dashboard/doctors')} className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" /> Find a Doctor
            </MenuItem>
            <MenuItem onClick={() => router.push('/patient-dashboard/appointments')} className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" /> My Appointments
            </MenuItem>

            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />
            <MenuItem>
                <div className="flex items-center gap-2"><ThemeSwitcher /><Typography variant="small">Change Theme</Typography></div>
            </MenuItem>
            <MenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-red-500">
                <PowerIcon className="h-4 w-4" /> Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Navbar>
  );
}