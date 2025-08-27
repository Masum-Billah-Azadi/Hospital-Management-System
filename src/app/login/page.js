// src/app/login/page.js
"use client";

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styles from './Login.module.scss';

const LoginPage = () => {
    const [formType, setFormType] = useState('login'); // 'login' or 'register'
    const [userRole, setUserRole] = useState('patient'); // 'patient' or 'doctor'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || (userRole === 'doctor' ? '/dashboard' : '/patient-dashboard');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formType === 'register') {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: userRole }),
                });

                if (res.ok) {
                    // রেজিস্ট্রেশন সফল হলে সরাসরি লগইন
                    const loginRes = await signIn('credentials', { redirect: false, email, password });
                    if (loginRes.ok) router.push(callbackUrl);
                    else setError('Login failed after registration.');
                } else {
                    const data = await res.json();
                    setError(data.message || 'Registration failed.');
                }
            } catch (err) { setError('An error occurred.'); }
        } else { // Handle Login
            try {
                const res = await signIn('credentials', { redirect: false, email, password });
                if (res.error) { setError('Invalid email or password.'); return; }
                router.push(callbackUrl);
            } catch (err) { setError('An error occurred during login.'); }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.roleSelector}>
                    <button onClick={() => setUserRole('patient')} className={userRole === 'patient' ? styles.active : ''}>I&apos;m a Patient</button>
                    <button onClick={() => setUserRole('doctor')} className={userRole === 'doctor' ? styles.active : ''}>I&apos;m a Doctor</button>
                </div>

                <h1 className={styles.title}>{formType === 'register' ? 'Create Account' : 'Login'}</h1>
                {error && <p className={styles.error}>{error}</p>}
                
                <form onSubmit={handleFormSubmit}>
                    {formType === 'register' && (
                        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className={styles.inputField}/>
                    )}
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.inputField}/>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.inputField}/>
                    <button type="submit" className={styles.submitButton}>
                        {formType === 'register' ? 'Register' : 'Login'}
                    </button>
                </form>

                {userRole === 'doctor' && formType === 'login' && (
                    <>
                        <div className={styles.divider}>OR</div>
                        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className={styles.googleButton}>
                            Sign in with Google
                        </button>
                    </>
                )}

                <p className={styles.toggleText}>
                    {formType === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={() => setFormType(formType === 'login' ? 'register' : 'login')}>
                        {formType === 'login' ? ' Register' : ' Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;