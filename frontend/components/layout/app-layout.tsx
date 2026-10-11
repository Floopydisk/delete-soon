"use client";

import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { User } from "@/lib/auth";

interface AppLayoutProps {
  user: User;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ user, children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;