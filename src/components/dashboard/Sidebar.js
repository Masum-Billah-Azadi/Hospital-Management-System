"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  BookOpenIcon, // ✅ নতুন আইকন ইমপোর্ট করা হলো
  CalendarDaysIcon,
  HomeIcon,
  PowerIcon,
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
    href: "/dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: <CalendarDaysIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/patients",
    label: "Patients",
    icon: <UserGroupIcon className="h-5 w-5" />,
  },
  // ✅ নতুন Homeo Repertory মেনুটি যুক্ত করা হলো
  {
    href: "/dashboard/homeo-repertory",
    label: "Homeo Repertory",
    icon: <BookOpenIcon className="h-5 w-5" />,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: <UserCircleIcon className="h-5 w-5" />,
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <Card className="sticky top-4 h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card">
      <div className="flex flex-col h-full">
        <div>
          <div className="mb-2 p-4">
            <Typography
              variant="h5"
              className="text-light-text-primary dark:text-dark-text-primary"
            >
              DocPortal
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
                                        } focus:bg-primary focus:text-white active:bg-primary active:text-white`}
                  >
                    <ListItemPrefix>{link.icon}</ListItemPrefix>
                    {link.label}
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </div>
        <div className="mt-auto">
          <ThemeSwitcher />
          <ListItem
            onClick={() => signOut({ callbackUrl: "/login" })}
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

export default Sidebar;
