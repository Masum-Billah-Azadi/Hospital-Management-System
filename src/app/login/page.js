"use client";

import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react'; // **পরিবর্তন:** useCallback ইম্পোর্ট করা হয়েছে
import styles from './Login.module.scss';

const LoginPage = () => {
    const [formType, setFormType] = useState('login'); // 'login' or 'register'
    // const [userRole, setUserRole] = useState('patient'); // **পরিবর্তন:** এই state-টির আর প্রয়োজন নেই
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // **পরিবর্তন:** redirectToDashboard ফাংশনটিকে useCallback দিয়ে মোড়ানো হয়েছে
    const redirectToDashboard = useCallback((role) => {
        if (role === 'doctor') router.push('/dashboard');
        else if (role === 'admin') router.push('/admin/dashboard');
        else router.push('/patient-dashboard');
    }, [router]);
    
    // যদি ব্যবহারকারী আগে থেকেই লগইন করা থাকেন, তাকে রিডাইরেক্ট করে দেওয়া
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role) {
            redirectToDashboard(session.user.role);
        }
    }, [status, session, redirectToDashboard]); // **পরিবর্তন:** redirectToDashboard যোগ করা হয়েছে

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formType === 'register') {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password, 
                        role: 'patient' // **পরিবর্তন:** নতুন ব্যবহারকারী সবসময় 'patient' হবেন
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Registration failed.');
                }
                
                const loginRes = await signIn('credentials', { redirect: false, email, password });
                if (loginRes.error) {
                    throw new Error('Login failed after registration. Please log in manually.');
                }
                
                redirectToDashboard('patient');

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } 
        else { // Login Logic
            try {
                const res = await signIn('credentials', { redirect: false, email, password });
                if (res.error) {
                    throw new Error('Invalid email or password.');
                }
                
                const updatedSession = await getSession();
                redirectToDashboard(updatedSession?.user?.role);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    if (status === 'loading' || status === 'authenticated') {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                {/* **পরিবর্তন:** Role Selector বাটন দুটি সরিয়ে ফেলা হয়েছে */}
                
                <h1 className={styles.title}>{formType === 'register' ? 'Create Account' : 'Login'}</h1>
                {error && <p className={styles.error}>{error}</p>}
                
                <form onSubmit={handleFormSubmit}>
                    {formType === 'register' && (
                        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className={styles.inputField}/>
                    )}
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.inputField}/>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.inputField}/>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Processing...' : (formType === 'register' ? 'Register' : 'Login')}
                    </button>
                </form>

                {/* **পরিবর্তন:** গুগল সাইন-ইন বাটন এখন সবার জন্য, শুধুমাত্র doctor login-এর জন্য নয় */}
                <div className={styles.divider}>OR</div>
                <button 
                    onClick={() => signIn('google', { callbackUrl: '/patient-dashboard' })} // ডিফল্ট রিডাইরেক্ট রোগীর ড্যাশবোর্ডে
                    className={styles.googleButton} 
                    disabled={loading}
                >
                    Continue with Google
                </button>

                <p className={styles.toggleText}>
                    {/* **পরিবর্তন:** ' এর পরিবর্তে &apos; ব্যবহার করা হয়েছে */}
                    {formType === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={() => { setFormType(formType === 'login' ? 'register' : 'login'); setError(''); }}>
                        {formType === 'login' ? ' Register' : ' Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;