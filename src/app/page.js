// src/app/page.js
"use client";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from './Home.module.scss';

export default function Home() {
  const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // যদি সেশন লোড হয়ে যায় এবং ব্যবহারকারী লগইন করা থাকেন
        if (status === "authenticated" && session) {
            // ভূমিকা অনুযায়ী সঠিক ড্যাশবোর্ডে রিডাইরেক্ট করা
            if (session.user?.role === 'doctor') {
                router.replace('/dashboard');
            } else if (session.user?.role === 'admin') {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/patient-dashboard');
            }
        }
    }, [session, status, router]);

    // সেশন লোড হওয়ার সময় বা ব্যবহারকারী লগইন করা থাকলে কিছুই দেখানো হবে না (ঐচ্ছিক)
    if (status === "loading" || status === "authenticated") {
        return <p>Loading...</p>; // অথবা একটি সুন্দর লোডিং স্পিনার দেখাতে পারেন
    }
  return (
    <main className={styles.mainContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Your Health, Our Priority</h1>
        <p className={styles.subtitle}>
          Book appointments with our expert doctors hassle-free.
        </p>
        <div className={styles.buttonGroup}>
          <Link href="/login" className={styles.secondaryButton}>
                Create Account / Login
          </Link>
        </div>
      </div>
    </main>
  );
}