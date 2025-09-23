// src/components/dashboard/Sidebar.js
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, Typography, IconButton } from "@material-tailwind/react";
import { HomeIcon, CalendarDaysIcon, UserGroupIcon, UserCircleIcon, PowerIcon } from "@heroicons/react/24/solid";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon className="h-6 w-6" /> },
    { href: "/dashboard/appointments", label: "Appointments", icon: <CalendarDaysIcon className="h-6 w-6" /> },
    { href: "/dashboard/patients", label: "Patients", icon: <UserGroupIcon className="h-6 w-6" /> },
    { href: "/dashboard/profile", label: "Profile", icon: <UserCircleIcon className="h-6 w-6" /> },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <Card className="sticky top-4 h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card">
            <div className="flex flex-col h-full">
                <div>
                    <div className="mb-2 p-4">
                        <Typography variant="h5" className="text-light-text-primary dark:text-dark-text-primary">
                            DocPortal
                        </Typography>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navLinks.map(link => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}>
                                    <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${isActive ? 'bg-primary text-white' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary/20'}`}>
                                        {link.icon}
                                        <Typography color="inherit">{link.label}</Typography>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                   <ThemeSwitcher />
                   <div onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-4 p-3 rounded-lg cursor-pointer text-red-500 hover:bg-red-500/10">
                       <PowerIcon className="h-6 w-6" />
                       <Typography color="inherit">Logout</Typography>
                   </div>
                </div>
            </div>
        </Card>
    );
};

export default Sidebar;