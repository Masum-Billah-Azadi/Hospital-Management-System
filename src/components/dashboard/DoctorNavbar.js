// src/components/dashboard/DoctorNavbar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Bars3Icon,
  CalendarDaysIcon,
  HeartIcon,
  HomeIcon,
  PowerIcon,
  UserCircleIcon,
  UserGroupIcon
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
import { useRouter } from "next/navigation"; // পরিবর্তন: useRouter ইম্পোর্ট করুন

export function DoctorNavbar() {
  const { data: session } = useSession();
  const router = useRouter(); // পরিবর্তন: useRouter হুক ব্যবহার করুন

  return (
    <Navbar className="w-full p-2 lg:hidden bg-light-card dark:bg-dark-card border-none text-light-text-primary dark:text-dark-text-primary">
      <div className="relative mx-auto flex items-center justify-between">
        <Typography onClick={() => router.push('/dashboard')} variant="h6" color="inherit" className="cursor-pointer">
          DocPortal
        </Typography>
        <Menu>
          <MenuHandler>
            <IconButton variant="text" color="inherit">
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          </MenuHandler>
          <MenuList className="bg-light-card dark:bg-dark-card border-gray-300 dark:border-blue-gray-100/20 text-light-text-primary dark:text-dark-text-primary">
            {/* ... প্রোফাইল MenuItem অপরিবর্তিত ... */}
            <MenuItem className="flex items-center gap-2">
              <Avatar size="sm" src={session?.user?.image || "/default-avatar.png"} alt={session?.user?.name || "Doctor"}/>
              <Typography variant="small" color="inherit" className="font-medium"> Dr. {session?.user?.name || "Doctor"} </Typography>
            </MenuItem>
            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />
            
            {/* পরিবর্তন: as={Link} এর পরিবর্তে onClick ব্যবহার করা হয়েছে */}
            <MenuItem onClick={() => router.push('/dashboard')} className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => router.push('/dashboard/appointments')} className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4" /> Appointments
            </MenuItem>
            <MenuItem onClick={() => router.push('/dashboard/patients')} className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" /> Patients
            </MenuItem>
             <MenuItem onClick={() => router.push('/dashboard/profile')} className="flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4" /> Profile
            </MenuItem>
             <MenuItem 
              onClick={() => window.open('http://anirban.lovestoblog.com/', '_blank')} 
              className="flex items-center gap-2"
            >
                <HeartIcon className="h-4 w-4" /> Blood Bank
            </MenuItem>
            
            {/* ... বাকি MenuItem গুলো অপরিবর্তিত ... */}
            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />
            <MenuItem><div className="flex items-center gap-2"><ThemeSwitcher /><Typography variant="small" color="inherit">Change Theme</Typography></div></MenuItem>
            <MenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-red-500"><PowerIcon className="h-4 w-4" /> Sign Out</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Navbar>
  );
}