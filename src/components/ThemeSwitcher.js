// src/components/ThemeSwitcher.js
"use client";
import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    // The "color" prop has been removed from here
    <IconButton variant="text" onClick={toggleTheme}>
      {theme === 'dark' ? (
        // A theme-aware className has been added here
        <SunIcon className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
      ) : (
        // A theme-aware className has been added here
        <MoonIcon className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
      )}
    </IconButton>
  );
}