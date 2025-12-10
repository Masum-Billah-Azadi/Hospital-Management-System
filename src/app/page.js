// src/app/page.js
"use client";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// Material Tailwind কম্পোনেন্টগুলো ইম্পোর্ট করা হয়েছে
import { Button, Spinner, Typography } from "@material-tailwind/react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // এই লজিকে কোনো পরিবর্তন করা হয়নি
    useEffect(() => {
        if (status === "authenticated" && session) {
            if (session.user?.role === 'doctor') {
                router.replace('/dashboard');
            } else if (session.user?.role === 'admin') {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/patient-dashboard');
            }
        }
    }, [session, status, router]);

    if (status === "loading" || status === "authenticated") {
        // একটি সুন্দর স্পিনার দেখানো হলো
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    // পুরোনো SCSS-এর পরিবর্তে এখানে Tailwind CSS ক্লাস এবং Material Tailwind কম্পোনেন্ট ব্যবহার করা হয়েছে
    return (
        <main 
            className="flex justify-center items-center min-h-screen p-8 text-white text-center 
                       bg-gradient-to-br from-dark-bg to-primary"
        >
            <div> {/* Hero Section এর জন্য একটি wrapper div */}
                <Typography 
                    variant="h1" 
                    color="white" 
                    className="font-bold mb-4 text-5xl"
                >
                    Your Health, Our Priority
                </Typography>
                
                <Typography 
                    variant="lead" 
                    color="white" 
                    className="mb-10 opacity-90"
                >
                    Book appointments with our expert doctors hassle-free.
                </Typography>
                
                <div className="flex justify-center gap-6">
                    <Link href="/login">
                        <Button variant="outlined" color="white" size="lg">
                            Create Account / Login
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}