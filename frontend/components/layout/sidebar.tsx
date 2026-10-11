"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Heart,
  Settings,
  LogOut,
  X,
  AlertCircle,
} from "lucide-react";
import { logout, User } from "@/lib/auth";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user }) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
      exact: true,
    },
    {
      name: "Users",
      href: "/admin/management/users",
      icon: Users,
    },
    {
      name: "Submissions",
      href: "/admin/management/submissions",
      icon: FileText,
    },
    {
      name: "Initiate Courtship",
      href: "/admin/courtship/initiate",
      icon: Heart,
      accent: "text-rose-400",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Dark Navy Sidebar */}
      <aside
        className={`fixed md:sticky top-3 bottom-3 left-3 z-50 w-64 md:w-60 bg-[#091122] text-white rounded-[32px] p-5 flex flex-col justify-between shadow-2xl border border-white/10 select-none transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[115%]"
        } h-[calc(100vh-24px)] shrink-0`}
      >
        <div>
          {/* Top: Daystar Dancing Figure Logo & Brand */}
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:bg-white/15 transition-all">
                {/* Clean White Vector Daystar Dancing Figure Logo */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-white"
                >
                  <circle cx="12" cy="5" r="2.5" />
                  <path d="M7 13c1.5-2 3-3 5-3s3.5 1 5 3" />
                  <path d="M12 10v9" />
                  <path d="M9 21l3-2 3 2" />
                  <path d="M18 6l2-2" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                  Daystar
                </span>
                <span className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
                  Forms Hub
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimal Vertical Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all ${
                    active
                      ? "bg-white/15 text-white shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      item.accent && !active ? item.accent : ""
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm transition-all text-left"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: User Profile & Red "N 1 Issue" Toast */}
        <div className="pt-5 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md">
              {user?.firstName?.[0] || user?.name?.[0] || "A"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin"}
              </p>
              <p className="text-[10px] text-white/50 truncate capitalize">
                {user?.role || "Administrator"}
              </p>
            </div>
          </div>

          {/* Red issue toast oval notification badge */}
          <Link
            href="/admin/management/submissions"
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white px-3.5 py-1.5 rounded-full flex items-center justify-between text-xs font-medium shadow-md shadow-red-900/40 transition-colors"
          >
            <span className="font-semibold text-[11px] tracking-wide">Alert</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
              N 1 Issue
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
