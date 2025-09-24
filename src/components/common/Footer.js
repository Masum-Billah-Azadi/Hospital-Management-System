// src/components/common/Footer.js
"use client";

import { Typography, IconButton } from "@material-tailwind/react";
import Link from 'next/link';

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="w-full bg-light-card dark:bg-dark-card p-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 text-center md:justify-between">
        <Typography className="text-light-text-primary dark:text-dark-text-primary font-normal">
          &copy; {currentYear} DocPortal - Developed by MD Masum and His team.
        </Typography>
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
          <li>
            <Typography
              as={Link}
              href="/about"
              className="font-normal transition-colors hover:text-primary text-light-text-secondary dark:text-dark-text-secondary dark:hover:text-primary"
            >
              About Us
            </Typography>
          </li>
          <li>
            <Typography
              as={Link}
              href="/contact"
              className="font-normal transition-colors hover:text-primary text-light-text-secondary dark:text-dark-text-secondary dark:hover:text-primary"
            >
              Contact Us
            </Typography>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;