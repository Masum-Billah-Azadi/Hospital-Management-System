// src/components/patient-dashboard/PatientSidebar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  BeakerIcon,
  CalendarDaysIcon,
  HeartIcon,
  HomeIcon,
  PowerIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    href: "/patient-dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    href: "/patient-dashboard/doctors",
    label: "Find a Doctor",
    icon: <UserGroupIcon className="h-5 w-5" />,
  },
  {
    href: "/patient-dashboard/appointments",
    label: "My Appointments",
    icon: <CalendarDaysIcon className="h-5 w-5" />,
  },
  {
    href: "/patient-dashboard/profile",
    label: "My Profile",
    icon: <UserCircleIcon className="h-5 w-5" />,
  },
];

const PatientSidebar = () => {
  const pathname = usePathname();

  return (
    <Card className="sticky top-0 h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card rounded-none">
      <div className="flex flex-col h-full">
        <div>
          <div className="mb-2 p-4">
            <Typography
              variant="h5"
              className="text-light-text-primary dark:text-dark-text-primary"
            >
              Patient Portal
            </Typography>
          </div>
          <List>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <ListItem
                    className={`
                                            ${
                                              isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/50"
                                                : "text-light-text-primary dark:text-dark-text-primary opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-800"
                                            }
                                            focus:bg-primary focus:text-white active:bg-primary active:text-white
                                        `}
                  >
                    <ListItemPrefix>{link.icon}</ListItemPrefix>
                    {link.label}
                  </ListItem>
                </Link>
              );
            })}

            {/* 🔴 Blood Bank – আগেরটার মতোই */}
            <a
              href="http://anirban.lovestoblog.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItem className="text-light-text-primary dark:text-dark-text-primary opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-800 focus:opacity-100 active:opacity-100">
                <ListItemPrefix>
                  <HeartIcon className="h-5 w-5" />
                </ListItemPrefix>
                Blood Bank
              </ListItem>
            </a>

            {/* 🟣 নতুন Northern Pharmacy লিংক */}
            <a
              href="https://northern-pharmacy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItem className="text-light-text-primary dark:text-dark-text-primary opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-800 focus:opacity-100 active:opacity-100">
                <ListItemPrefix>
                  <BeakerIcon className="h-5 w-5" />
                </ListItemPrefix>
                Northern Pharmacy
              </ListItem>
            </a>

            <a
              href="https://northern-ambulance.infinityfreeapp.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItem className="text-light-text-primary dark:text-dark-text-primary opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-800 focus:opacity-100 active:opacity-100">
                <ListItemPrefix>
                  <TruckIcon className="h-5 w-5" />
                </ListItemPrefix>
                Northern Ambulance
              </ListItem>
            </a>
          </List>
        </div>

        <div className="mt-auto">
          <ThemeSwitcher />
          <ListItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
          >
            <ListItemPrefix>
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            Logout
          </ListItem>
        </div>
      </div>
    </Card>
  );
};

export default PatientSidebar;
