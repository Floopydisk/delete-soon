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
    <div className="min-h-screen bg-[#edeef5] text-[#0f172a] font-sans antialiased flex p-3 md:p-4 gap-4 md:gap-5 overflow-x-hidden">
      {/* Floating Navy Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
      />

      {/* Main Content Area with Liquid Glass Container */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[1440px] overflow-hidden">
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
