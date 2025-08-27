// src/app/layout.js
import { Poppins } from "next/font/google";
import "@/styles/globals.scss";
import AuthProvider from "./AuthProvider"; // We will create this component

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Doctor's Portal",
  description: "A modern hospital management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}