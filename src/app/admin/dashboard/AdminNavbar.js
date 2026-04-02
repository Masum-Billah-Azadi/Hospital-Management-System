// src/app/admin/dashboard/AdminNavbar.js
"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Bars3Icon,
  BeakerIcon,
  Cog6ToothIcon,
  HomeIcon, // ✅ HomeIcon যুক্ত করা হয়েছে
  PowerIcon,
  ReceiptRefundIcon,
  TruckIcon,
  UserCircleIcon,
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
import Link from "next/link";

export function AdminNavbar() {
  const { data: session } = useSession();

  return (
    <Navbar className="w-full p-2 lg:hidden bg-light-card dark:bg-dark-card border-none text-light-text-primary dark:text-dark-text-primary">
      <div className="relative mx-auto flex items-center justify-between">
        <Typography variant="h6" color="inherit">
          Admin Panel
        </Typography>
        <Menu>
          <MenuHandler>
            <IconButton variant="text" color="inherit">
              <Bars3Icon className="h-6 w-6" />
            </IconButton>
          </MenuHandler>

          <MenuList className="bg-light-card dark:bg-dark-card border-gray-300 dark:border-blue-gray-100/20 text-light-text-primary dark:text-dark-text-primary">
            {/* Admin Avatar & Name */}
            <MenuItem className="flex items-center gap-2 pointer-events-none">
              <Avatar
                size="sm"
                variant="circular"
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name || "Admin"}
              />
              <Typography variant="small" className="font-medium">
                {session?.user?.name}
              </Typography>
            </MenuItem>

            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />

            {/* ✅ নতুন সংযোজন: Dashboard লিংক */}
            <Link href="/admin/dashboard" className="outline-none">
              <MenuItem className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Dashboard
                </Typography>
              </MenuItem>
            </Link>

            {/* Profile Link */}
            <Link href="/admin/dashboard/profile" className="outline-none">
              <MenuItem className="flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Edit Profile
                </Typography>
              </MenuItem>
            </Link>

            {/* Refunds বাটন */}
            <Link href="/admin/dashboard/refunds" className="outline-none">
              <MenuItem className="flex items-center gap-2">
                <ReceiptRefundIcon className="h-4 w-4" />
                <Typography variant="small" className="font-medium">
                  Refunds
                </Typography>
              </MenuItem>
            </Link>
            <Link
              href="/dashboard/homeo-repertory"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-lg font-medium"
            >
              <span>⚕️</span>
              <span>Homeo Repertory</span>
            </Link>

            {/* Blood Bank (old) */}
            <MenuItem
              onClick={() =>
                window.open(
                  "http://anirban.lovestoblog.com/admin/login.php",
                  "_blank",
                )
              }
              className="flex items-center gap-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <Typography variant="small" className="font-medium">
                Blood Bank
              </Typography>
            </MenuItem>

            {/* অন্যান্য মেনু আইটেমগুলো */}
            <MenuItem
              onClick={() =>
                window.open(
                  "https://northern-ambulance.infinityfreeapp.com/admin/dashboard.php",
                  "_blank",
                )
              }
              className="flex items-center gap-2"
            >
              <TruckIcon className="h-4 w-4" />
              <Typography variant="small" className="font-medium">
                Northern Ambulance
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() =>
                window.open("https://northern-pharmacy.vercel.app/", "_blank")
              }
              className="flex items-center gap-2"
            >
              <BeakerIcon className="h-4 w-4" />
              <Typography variant="small" className="font-medium">
                Northern Pharmacy
              </Typography>
            </MenuItem>

            <hr className="my-2 border-gray-300 dark:border-blue-gray-50" />

            {/* Theme */}
            <MenuItem>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Typography variant="small">Change Theme</Typography>
              </div>
            </MenuItem>

            {/* ✅ Sign Out (স্টাইল আপডেট করা হয়েছে: লাল ব্যাকগ্রাউন্ড, সাদা টেক্সট) */}
            <MenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white hover:text-white focus:text-white mt-2 rounded-md transition-colors"
            >
              <PowerIcon className="h-4 w-4 text-white" />
              <Typography variant="small" className="font-medium text-white">
                Sign Out
              </Typography>
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Navbar>
  );
}
