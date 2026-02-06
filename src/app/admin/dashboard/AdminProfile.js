// src/app/admin/dashboard/AdminProfile.js
"use client";
import { Avatar, Button, Card, Typography } from "@material-tailwind/react";
import { signOut, useSession } from "next-auth/react";

export function AdminProfile() {
  const { data: session } = useSession();

  return (
    <Card className="sticky top-4 h-[calc(100vh-2rem)] p-4 shadow-xl shadow-blue-gray-900/5 bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary w-full max-w-sm">
      <Typography variant="h5" className="mb-4">
        My Profile
      </Typography>

      <div className="flex flex-col items-center gap-4">
        <Avatar
          src={session?.user?.image || "/default-avatar.png"}
          alt="Admin Avatar"
          size="xxl"
        />
        <Typography variant="h6">{session?.user?.name || "Admin"}</Typography>
        <Typography variant="small" className="opacity-80">
          {session?.user?.email || "admin@example.com"}
        </Typography>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {/* Old Blood Bank Admin Button */}
        <Button
          variant="gradient"
          color="blue"
          onClick={() =>
            window.open(
              "http://anirban.lovestoblog.com/admin/login.php",
              "_blank",
            )
          }
        >
          Blood Bank Admin
        </Button>

        {/* 🟣 NEW Northern Pharmacy Admin Button */}
        <Button
          variant="gradient"
          color="green"
          onClick={() =>
            window.open("https://northern-pharmacy.vercel.app/admin", "_blank")
          }
        >
          Northern Pharmacy Admin
        </Button>
        <Button
          variant="gradient"
          color="red"
          onClick={() =>
            window.open(
              "https://northern-ambulance.infinityfreeapp.com/admin/dashboard.php",
              "_blank",
            )
          }
        >
          Northern Ambulance
        </Button>

        {/* Logout */}
        <Button
          variant="outlined"
          color="blue-gray"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </Button>
      </div>
    </Card>
  );
}
