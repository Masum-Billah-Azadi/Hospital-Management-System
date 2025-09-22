// src/context/ThemeContext.js
"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // ডিফল্ট থিম ডার্ক

  useEffect(() => {
    // পেজ লোড হওয়ার সময় localStorage থেকে সেভ করা থিম লোড করবে
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);
  
  useEffect(() => {
    // থিম পরিবর্তন হলে HTML ট্যাগে 'dark' ক্লাস যোগ বা রিমুভ করবে
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // ব্যবহারকারীর পছন্দ localStorage-এ সেভ করবে
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);