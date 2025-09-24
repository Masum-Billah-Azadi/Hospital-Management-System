// src/app/providers.js
"use client";

import { ThemeProvider as MaterialThemeProvider } from "@material-tailwind/react";
import AuthProvider from "./AuthProvider";
import { AppThemeProvider } from "@/context/ThemeContext"; // নতুন ইম্পোর্ট

export function Providers({ children }) {
  return (
    // AppThemeProvider দিয়ে সবকিছু র‍্যাপ করা হয়েছে
    <AppThemeProvider>
      <MaterialThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </MaterialThemeProvider>
    </AppThemeProvider>
  );
}