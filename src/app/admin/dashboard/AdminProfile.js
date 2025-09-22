// src/app/admin/dashboard/AdminProfile.js
"use client";
import {
  Avatar,
  Button,
  Card,
  Typography,
} from "@material-tailwind/react";
import { signOut, useSession } from "next-auth/react";

export function AdminProfile() {
  const { data: session } = useSession();

  return (
    <Card className="sticky top-4 p-4 shadow-xl shadow-blue-gray-900/5 bg-dark-card text-white w-full max-w-sm">
      
      <Typography variant="h5" className="mb-4">My Profile</Typography>
      <div className="flex flex-col items-center gap-4">
        <Avatar src={session?.user?.image || "/default-avatar.png"} alt="Admin Avatar" size="xxl" />
        <Typography variant="h6">{session?.user?.name || "Admin"}</Typography>
        <Typography variant="small" className="opacity-80">{session?.user?.email || "admin@example.com"}</Typography>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <Button 
            variant="gradient" 
            color="blue"
            onClick={() => window.open("http://anirban.lovestoblog.com/admin/login.php", "_blank")}
        >
            Blood Bank Admin
        </Button>
        <Button 
            variant="outlined" 
            color="white"
            onClick={() => signOut({ callbackUrl: '/' })}
        >
            Logout
        </Button>
      </div>
    </Card>
  );
}