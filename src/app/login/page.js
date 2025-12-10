// src/app/login/page.js
import { Suspense } from 'react';
import LoginForm from './LoginForm';

const LoginPage = () => {
  return (
    // এই div এবং className টি পুরো পেইজে লেআউট এবং ব্যাকগ্রাউন্ড যুক্ত করবে
    <div className="min-h-screen w-full flex justify-center items-center bg-cover bg-center p-4" 
         style={{ backgroundImage: "url('/wave.svg')" }}>
      <Suspense fallback={<p>Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;