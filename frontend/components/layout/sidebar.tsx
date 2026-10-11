"use client";

import React from "react";
import Link from "next/link";
import { Home, Users, FileText, Settings, LogOut, Heart } from "lucide-react";
import { logout, User } from "@/lib/auth";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black opacity-50 transition-opacity md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition-transform md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold">Daystar</h1>
        </div>
        <nav className="mt-10">
          <Link
            href="/admin/dashboard"
            className="flex items-center px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Home className="h-6 w-6" />
            <span className="ml-4">Dashboard</span>
          </Link>
          {user.role === 'superAdmin' && (
            <Link
              href="/admin/management/users"
              className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Users className="h-6 w-6" />
              <span className="ml-4">Users</span>
            </Link>
          )}
          <Link
            href="/admin/management/submissions"
            className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FileText className="h-6 w-6" />
            <span className="ml-4">Submissions</span>
          </Link>
          <Link
            href="/admin/courtship/initiate"
            className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Heart className="h-6 w-6" />
            <span className="ml-4">Initiate Courtship</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Settings className="h-6 w-6" />
            <span className="ml-4">Settings</span>
          </Link>
          <div
            onClick={() => logout()}
            className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <LogOut className="h-6 w-6" />
            <span className="ml-4">Logout</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
