"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Plus, Bell, Sparkles } from "lucide-react";
import { User } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: User;
  onToggleSidebar: () => void;
}

const getHeaderMeta = (pathname: string) => {
  if (pathname.includes("/management/submissions")) {
    return {
      title: "Submissions & Verification Queue",
      subtitle: "Review, approve, and manage incoming form submissions",
    };
  }
  if (pathname.includes("/management/users")) {
    return {
      title: "Pastoral & Admin Directory",
      subtitle: "Manage ministers, zonal coordinators, and administrative access",
    };
  }
  if (pathname.includes("/courtship/initiate")) {
    return {
      title: "Initiate Marriage Mentoring Campaign",
      subtitle: "Generate dedicated courtship registration access for couples",
    };
  }
  if (pathname.includes("/settings")) {
    return {
      title: "Forms Hub Settings & Workflows",
      subtitle: "Manage regional routing, notification triggers, and security",
    };
  }
  if (pathname.includes("/management/reports")) {
    return {
      title: "Form Operations Analytics",
      subtitle: "Insights on submissions, approval cycle times, and zonal activity",
    };
  }
  return {
    title: "Welcome Back to Your Form Operations Hub",
    subtitle: "High-level overview of forms, workflows, and submissions",
  };
};

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar }) => {
  const pathname = usePathname();
  const meta = getHeaderMeta(pathname);

  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-xs border border-white flex items-center justify-center text-slate-700 hover:text-slate-900"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#091122] tracking-tight">
              {meta.title}
            </h1>
            <span className="text-xl md:text-2xl inline-block animate-pulse select-none">
              ✨
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
        {/* Search Trigger */}
        <Link
          href="/admin/management/submissions"
          className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-xs border border-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          title="Search submissions"
        >
          <Search className="w-5 h-5" />
        </Link>

        {/* Primary Call to Action Button */}
        <Link
          href="/admin/courtship/initiate"
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Initiate New Form Campaign</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
