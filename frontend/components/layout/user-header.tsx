"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const UserHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/images/daystar_logo.png"
            alt="Daystar Logo"
            width={40}
            height={40}
          />
        </Link>
      </div>
      <nav className="flex items-center space-x-4">
        <Link href="https://daystarng.org" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          Home
        </Link>
        <a href="https://daystarng.org/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          About
        </a>
      </nav>
    </header>
  );
};

export default UserHeader;
