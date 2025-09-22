// src/app/layout.js

import "@/styles/globals.css";
import { Poppins } from "next/font/google";
import { Providers } from "./providers"; // <-- নতুন Providers কম্পোনেন্ট ইম্পোর্ট করুন
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
      <body>
        {/* AuthProvider এবং ThemeProvider এর পরিবর্তে শুধু Providers ব্যবহার করুন */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}