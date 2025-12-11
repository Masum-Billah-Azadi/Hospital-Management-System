// src/app/admin/dashboard/AdminNavbar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Bars3Icon, Cog6ToothIcon, PowerIcon, BeakerIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Navbar,
  Typography
} from "@material-tailwind/react";
import { signOut, useSession } from "next-auth/react";

export function AdminNavbar() {
    const { data: session } = useSession();

    return (
        <Navbar className="w-full p-2 lg:hidden bg-light-card dark:bg-dark-card border-none text-light-text-primary dark:text-dark-text-primary">
            <div className="relative mx-auto flex items-center justify-between">
                <Typography variant="h6" color="inherit">Admin Panel</Typography>
                <Menu>
                    <MenuHandler>
                        <IconButton variant="text" color="inherit">
                            <Bars3Icon className="h-6 w-6" />
                        </IconButton>
                    </MenuHandler>

                    <MenuList className="bg-light-card dark:bg-dark-card border-gray-300 dark:border-blue-gray-100/20 text-light-text-primary dark:text-dark-text-primary">

                        {/* Admin Avatar */}
                        <MenuItem className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                variant="circular"
                                src={session?.user?.image || "/default-avatar.png"}
                                alt={session?.user?.name || "Admin"}
                            />
                            <Typography variant="small" className="font-medium">{session?.user?.name}</Typography>
                        </MenuItem>

                        {/* Blood Bank (old) */}
                        <MenuItem
                            onClick={() =>
                                window.open("http://anirban.lovestoblog.com/admin/login.php", "_blank")
                            }
                            className="flex items-center gap-2"
                        >
                            <Cog6ToothIcon className="h-4 w-4" />
                            <Typography variant="small" className="font-medium">Blood Bank</Typography>
                        </MenuItem>

                        {/* 🟣 NEW — Northern Pharmacy */}
                        <MenuItem
                            onClick={() =>
                                window.open("https://northern-pharmacy.vercel.app/", "_blank")
                            }
                            className="flex items-center gap-2"
                        >
                            <BeakerIcon className="h-4 w-4" />
                            <Typography variant="small" className="font-medium">Northern Pharmacy</Typography>
                        </MenuItem>

                        <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />

                        {/* Theme */}
                        <MenuItem>
                            <div className="flex items-center gap-2">
                                <ThemeSwitcher />
                                <Typography variant="small">Change Theme</Typography>
                            </div>
                        </MenuItem>

                        {/* Sign Out */}
                        <MenuItem
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2"
                        >
                            <PowerIcon className="h-4 w-4 text-red-500" />
                            <Typography variant="small" className="font-medium text-red-500">
                                Sign Out
                            </Typography>
                        </MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Navbar>
    );
}
