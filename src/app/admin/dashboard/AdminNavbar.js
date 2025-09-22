// src/app/admin/dashboard/AdminNavbar.js
"use client";
import { Bars3Icon, Cog6ToothIcon, PowerIcon } from "@heroicons/react/24/solid";
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
    <Navbar className="w-full p-2 lg:hidden bg-dark-card border-none">
      <div className="relative mx-auto flex items-center justify-between text-white">
        <Typography variant="h6">Admin Panel</Typography>
        <Menu>
          <MenuHandler>
            <IconButton variant="text" color="white">
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          </MenuHandler>
          <MenuList>
            <MenuItem className="flex items-center gap-2">
              <Avatar
                size="sm"
                variant="circular"
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name || "Admin"}
              />
              <Typography variant="small" className="font-medium">
                {session?.user?.name || "Admin"}
              </Typography>
            </MenuItem>
            <MenuItem 
                onClick={() => window.open("http://anirban.lovestoblog.com/admin/login.php", "_blank")}
                className="flex items-center gap-2"
            >
                <Cog6ToothIcon className="h-4 w-4" />
                <Typography variant="small" className="font-medium">Blood Bank</Typography>
            </MenuItem>
            <hr className="my-2 border-blue-gray-50" />
            <MenuItem onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2">
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