// src/components/patient-dashboard/PatientSidebar.js
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, Typography } from "@material-tailwind/react";
import { HomeIcon, UserGroupIcon, CalendarDaysIcon, PowerIcon, HeartIcon } from "@heroicons/react/24/solid";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const navLinks = [
    { href: "/patient-dashboard", label: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { href: "/patient-dashboard/doctors", label: "Find a Doctor", icon: <UserGroupIcon className="h-5 w-5" /> },
    { href: "/patient-dashboard/appointments", label: "My Appointments", icon: <CalendarDaysIcon className="h-5 w-5" /> },
];

const PatientSidebar = () => {
    const pathname = usePathname();

    return (
        <Card className="sticky top-0 h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card rounded-none">
             <div className="flex flex-col h-full">
                <div>
                    <div className="mb-2 p-4">
                        <Typography variant="h5" className="text-light-text-primary dark:text-dark-text-primary">Patient Portal</Typography>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navLinks.map(link => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}>
                                    <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${isActive ? 'bg-primary text-white' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary/20'}`}>
                                        {link.icon} <Typography color="inherit">{link.label}</Typography>
                                    </div>
                                </Link>
                            );
                        })}
                        <a href="http://anirban.lovestoblog.com/" target="_blank" rel="noopener noreferrer">
                             <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary/20`}>
                                <HeartIcon className="h-5 w-5" /> <Typography color="inherit">Blood Bank</Typography>
                            </div>
                        </a>
                    </nav>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                   <ThemeSwitcher />
                   <div onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-4 p-3 rounded-lg cursor-pointer text-red-500 hover:bg-red-500/10">
                       <PowerIcon className="h-6 w-6" /> <Typography color="inherit">Logout</Typography>
                   </div>
                </div>
            </div>
        </Card>
    );
};

export default PatientSidebar;