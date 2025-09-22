// src/app/login/LoginForm.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Material Tailwind এবং Heroicons থেকে প্রয়োজনীয় কম্পোনেন্ট ইম্পোর্ট করা হয়েছে
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Button,
} from "@material-tailwind/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const LoginForm = () => {
    // --- আপনার পুরোনো সব state এবং logic অপরিবর্তিত রাখা হয়েছে ---
    const [formType, setFormType] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // বন্ধুর প্রজেক্ট থেকে show/hide password ফিচারটি যোগ করা হয়েছে
    const [showPass, setShowPass] = useState(false);
    const handleShowPass = () => setShowPass((prev) => !prev);

    const redirectToDashboard = useCallback((role) => {
        if (role === 'doctor') router.push('/dashboard');
        else if (role === 'admin') router.push('/admin/dashboard');
        else router.push('/patient-dashboard');
    }, [router]);
    
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role) {
            redirectToDashboard(session.user.role);
        }
    }, [status, session, redirectToDashboard]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formType === 'register') {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'patient' }),
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
        } else { // Login Logic
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
        return <p className="text-xl text-gray-700">Loading...</p>;
    }

    // --- এখানে নতুন UI যুক্ত করা হয়েছে ---
    return (
        <Card className="w-full max-w-sm">
            <CardHeader
                variant="gradient"
                color="blue"
                className="mb-4 grid h-28 place-items-center"
            >
                <Typography variant="h3" color="white">
                    {formType === 'register' ? 'Create Account' : 'Sign In'}
                </Typography>
            </CardHeader>
            
            <form onSubmit={handleFormSubmit}>
                <CardBody className="flex flex-col gap-4">
                    {/* Registration-এর জন্য Name Field */}
                    {formType === 'register' && (
                        <Input
                            crossOrigin={""}
                            label="Full Name"
                            size="lg"
                            color="blue"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <Input
                        crossOrigin={""}
                        type="email"
                        label="Email"
                        size="lg"
                        color="blue"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        crossOrigin={""}
                        type={showPass ? "text" : "password"}
                        label="Password"
                        size="lg"
                        color="blue"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={
                            showPass ? (
                                <EyeIcon onClick={handleShowPass} className="h-5 w-5 text-blue-500 cursor-pointer" />
                            ) : (
                                <EyeSlashIcon onClick={handleShowPass} className="h-5 w-5 cursor-pointer" />
                            )
                        }
                    />
                    {/* আপনার পুরোনো error message টি এখানে দেখানো হচ্ছে */}
                    {error && <Typography color="red" className="text-center text-sm">{error}</Typography>}
                </CardBody>

                <CardFooter className="pt-0">
                    <Button type="submit" variant="gradient" color="blue" fullWidth disabled={loading}>
                        {loading ? 'Processing...' : (formType === 'register' ? 'Register' : 'Sign In')}
                    </Button>

                    {/* আপনার Google Sign-In বাটনটি এখানে যোগ করা হয়েছে */}
                    <div className="my-4 flex items-center justify-center">
                        <div className="h-px w-full bg-gray-300"></div>
                        <p className="mx-4 text-gray-600">or</p>
                        <div className="h-px w-full bg-gray-300"></div>
                    </div>
                    <Button
                        onClick={() => signIn('google', { callbackUrl: '/patient-dashboard' })}
                        variant="outlined"
                        color="blue-gray"
                        fullWidth
                        disabled={loading}
                    >
                        Continue with Google
                    </Button>
                    
                    <Typography variant="small" className="mt-6 flex justify-center">
                        {formType === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <Typography
                            as="a"
                            href="#"
                            variant="small"
                            color="blue"
                            className="ml-1 font-bold cursor-pointer"
                            onClick={() => { setFormType(formType === 'login' ? 'register' : 'login'); setError(''); }}
                        >
                            {formType === 'login' ? 'Sign Up' : 'Sign In'}
                        </Typography>
                    </Typography>
                </CardFooter>
            </form>
        </Card>
    );
};

export default LoginForm;