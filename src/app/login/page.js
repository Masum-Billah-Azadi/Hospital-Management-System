// src/app/login/page.js
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.scss'; // We'll create this file next

const LoginPage = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegistering) {
            // Handle Registration
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'doctor' }),
                });

                if (res.ok) {
                    // Automatically log in the user after successful registration
                    const loginRes = await signIn('credentials', {
                        redirect: false,
                        email,
                        password,
                    });
                    if (loginRes.ok) router.push('/dashboard');
                    else setError('Login failed after registration.');
                } else {
                    const data = await res.json();
                    setError(data.message || 'Registration failed.');
                }
            } catch (err) {
                setError('An error occurred.');
            }
        } else {
            // Handle Login
            try {
                const res = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                });

                if (res.error) {
                    setError('Invalid email or password.');
                    return;
                }
                
                router.push('/dashboard'); // Redirect to dashboard after successful login

            } catch (err) {
                setError('An error occurred during login.');
            }
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h1 className={styles.title}>{isRegistering ? 'Create Doctor Account' : 'Doctor Login'}</h1>
                {error && <p className={styles.error}>{error}</p>}
                
                <form onSubmit={handleManualSubmit}>
                    {isRegistering && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.inputField}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.inputField}
                    />
                    <button type="submit" className={styles.submitButton}>
                        {isRegistering ? 'Register' : 'Login'}
                    </button>
                </form>

                <div className={styles.divider}>OR</div>

                <button onClick={handleGoogleSignIn} className={styles.googleButton}>
                    Sign in with Google
                </button>

                <p className={styles.toggleText}>
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                    <span onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? ' Login' : ' Register'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;