// src/app/AuthProvider.js
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// যে রুটগুলোকে আমরা সুরক্ষিত করতে চাই, সেগুলোর তালিকা
const protectedRoutes = ["/dashboard", "/patient-dashboard"];

// এই কম্পোনেন্টটি নিরাপত্তা প্রহরীর কাজ করবে
const AuthGuard = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    useEffect(() => {
        // যদি সেশন লোডিং না থাকে...
        if (status !== 'loading') {
            // ...এবং ইউজার লগইন করা না থাকে এবং পেজটি সুরক্ষিত হয়
            if (!session && isProtectedRoute) {
                // ...তাহলে তাকে লগইন পেজে পাঠিয়ে দাও
                router.push(`/login?callbackUrl=${pathname}`);
            } 
            // ...অথবা যদি ইউজার লগইন করা থাকে
            else if (session) {
                const userRole = session.user.role;

                // যদি একজন রোগী ডাক্তারের ড্যাশবোর্ডে যাওয়ার চেষ্টা করে
                if (pathname.startsWith('/dashboard') && userRole === 'patient') {
                    router.push('/patient-dashboard');
                }
                // যদি একজন ডাক্তার রোগীর ড্যাশবোর্ডে যাওয়ার চেষ্টা করে
                else if (pathname.startsWith('/patient-dashboard') && userRole === 'doctor') {
                    router.push('/dashboard');
                }
            }
        }
    }, [session, status, router, isProtectedRoute, pathname]);

    // যদি পেজটি সুরক্ষিত হয় এবং সেশন লোড হতে থাকে বা ইউজার লগইন করা না থাকে...
    if ((status === 'loading' || !session) && isProtectedRoute) {
        // ...তাহলে একটি লোডিং মেসেজ দেখাও
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    // যদি সবকিছু ঠিক থাকে, তাহলে পেজের কন্টেন্ট দেখাও
    return children;
};


export default function AuthProvider({ children }) {
    return (
        <SessionProvider>
            <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
    );
};