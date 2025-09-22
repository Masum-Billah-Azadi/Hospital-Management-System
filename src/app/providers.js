// src/app/providers.js
"use client"; // <-- এটি সবচেয়ে গুরুত্বপূর্ণ অংশ

import { ThemeProvider } from "@material-tailwind/react";
import AuthProvider from "./AuthProvider";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}