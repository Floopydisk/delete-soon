"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Home,
  Users,
  FileText,
  Heart,
  Settings,
  LogOut,
  GraduationCap,
  Headphones,
  FileSpreadsheet,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface MakeDashboardProps {
  user?: any;
}

export function MakeStyleDashboard({ user }: MakeDashboardProps) {
  const [activeTab, setActiveTab] = useState("Organization");
  const [graphTab, setGraphTab] = useState<"submissions" | "completion">("submissions");
  const [year, setYear] = useState("2025");
  const [selectedPill, setSelectedPill] = useState<number | null>(4); // default highlight 75%
  const [showImageMockup, setShowImageMockup] = useState(false);

  const tabs = [
    "Organization",
    "Users",
    "Forms",
    "Campaigns",
    "Reviews",
    "Analysis",
    "Exports",
  ];

  // Graph pill bars data mirroring reference 0
  const pillData = [
    { label: "Jan", fillPercent: 50, dotPercent: "50%", height: "50%" },
    { label: "Feb", fillPercent: 25, dotPercent: "45%", height: "25%" },
    { label: "Mar", fillPercent: 70, dotPercent: "70%", height: "70%" },
    { label: "Apr", fillPercent: 90, dotPercent: "30%", height: "90%" },
    { label: "May", fillPercent: 38, dotPercent: "75%", height: "38%" },
    { label: "Jun", fillPercent: 62, dotPercent: "60%", height: "62%" },
    { label: "Jul", fillPercent: 78, dotPercent: "80%", height: "78%" },
    { label: "Aug", fillPercent: 42, dotPercent: "45%", height: "42%" },
  ];

  const infoCards = [
    {
      id: "academy",
      title: "Form Creator Academy",
      desc: "Learn to build multi-stage workflows",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
      href: "/forms/courtship",
    },
    {
      id: "helpdesk",
      title: "Submitter Help Desk",
      desc: "Instant support & live pastoral guidance",
      icon: Headphones,
      color: "bg-indigo-50 text-indigo-600",
      href: "/forms/burial-request",
    },
    {
      id: "directory",
      title: "Partner Directory",
      desc: "Connect with regional pastors & zones",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/management/users",
    },
    {
      id: "blog",
      title: "Form Insights Blog",
      desc: "Best practices for church forms & audit",
      icon: FileSpreadsheet,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/management/submissions",
    },
    {
      id: "cases",
      title: "Case Studies",
      desc: "How 12 zones automated verification",
      icon: BarChart3,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/management/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-[#edeef5] p-3 md:p-6 text-[#0f172a] font-sans antialiased">
      {/* View Switcher Bar */}
      <div className="max-w-[1440px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daystar Liquid Glass Dashboard Architecture
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImageMockup(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              !showImageMockup
                ? "bg-[#0b1426] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Interactive UI Mode
          </button>
          <button
            onClick={() => setShowImageMockup(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              showImageMockup
                ? "bg-[#0b1426] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Show Design Image Mockup
          </button>
        </div>
      </div>

      {showImageMockup ? (
        /* Image Mockup Preview */
        <div className="max-w-[1440px] mx-auto bg-white rounded-3xl p-4 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between pb-3 border-b mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">High-Fidelity Rendered Artifact</h3>
              <p className="text-xs text-slate-500">Strictly generated following the reference architecture</p>
            </div>
            <button
              onClick={() => setShowImageMockup(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium"
            >
              Switch to Live Interactive UI
            </button>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900">
            <img
              src="/images/forms_dashboard_ui.jpg"
              alt="Daystar Custom Forms App Dashboard UI Mockup"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : (
        /* Full Replicated Interactive Dashboard */
        <div className="max-w-[1440px] mx-auto flex gap-4 md:gap-5 items-stretch">
          {/* 1. Left Sidebar (Deep Dark Navy Blue, Rounded Rectangle) */}
          <aside className="w-18 md:w-56 shrink-0 bg-[#091122] text-white rounded-[32px] p-4 md:p-5 flex flex-col justify-between shadow-2xl border border-white/10 select-none">
            <div>
              {/* Daystar Brand Logo */}
              <div className="flex items-center gap-3 px-2 py-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/15">
                  {/* Simplified Daystar Dancing Figure Icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
                <div className="hidden md:block">
                  <span className="text-lg font-bold tracking-tight text-white block">Daystar</span>
                  <span className="text-[10px] text-white/50 tracking-wider uppercase">Forms Hub</span>
                </div>
              </div>

              {/* Vertical Navigation Links */}
              <nav className="space-y-1.5">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/15 text-white font-medium shadow-xs transition-all"
                >
                  <Home className="w-5 h-5 shrink-0 text-white" />
                  <span className="hidden md:inline text-sm">Dashboard</span>
                </Link>

                <Link
                  href="/admin/management/users"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <Users className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline text-sm">Users</span>
                </Link>

                <Link
                  href="/admin/management/submissions"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline text-sm">Submissions</span>
                </Link>

                <Link
                  href="/admin/courtship/initiate"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <Heart className="w-5 h-5 shrink-0 text-red-400" />
                  <span className="hidden md:inline text-sm">Initiate Courtship</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline text-sm">Settings</span>
                </Link>

                <Link
                  href="/admin/login"
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline text-sm">Logout</span>
                </Link>
              </nav>
            </div>

            {/* Bottom Profile & Red Toast Issue */}
            <div className="pt-6 border-t border-white/10 flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3 px-1">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.[0] || "A"}
                  </span>
                </div>
                <div className="hidden md:block overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.name || "Pastor Admin"}
                  </p>
                  <p className="text-[10px] text-white/50 truncate">
                    {user?.email || "admin@daystarng.org"}
                  </p>
                </div>
              </div>

              {/* Red issue toast oval badge */}
              <div className="w-full">
                <div className="bg-[#e11d48] text-white px-3 py-1.5 rounded-full flex items-center justify-center md:justify-between text-xs font-medium shadow-md shadow-red-900/40">
                  <span className="hidden md:inline font-semibold">Alert</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    N 1 Issue
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Canvas */}
          <main className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* 2. Top Navigation Row */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#091122] tracking-tight">
                  Welcome Back to Your Form Operations Hub
                </h1>
                <span className="text-2xl inline-block animate-pulse">✨</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-white/80 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                  <Search className="w-5 h-5" />
                </div>

                <Link
                  href="/admin/courtship/initiate"
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Initiate New Form Campaign</span>
                </Link>
              </div>
            </header>

            {/* 3. Horizontal Content Tabs */}
            <nav className="flex items-center gap-2 md:gap-4 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all relative ${
                    activeTab === tab
                      ? "text-[#091122]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-[#091122] rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>

            {/* 4. Summary Cards (3 cards row) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Light Lavender/Blue with circular usage gauge */}
              <div className="bg-[#dbeafe]/70 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-[#091122] tracking-tight">
                      683
                    </h2>
                    <p className="text-sm font-bold text-[#1e293b] mt-0.5">
                      Active Forms
                    </p>
                    <div className="inline-flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 mt-2 shadow-2xs">
                      <span>+3.1%</span>
                      <span className="font-normal text-slate-600">this week</span>
                    </div>
                  </div>

                  {/* Circular Usage Metric SVG Ring */}
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-blue-200"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#2563eb]"
                        strokeDasharray="72, 100"
                        strokeLinecap="round"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[#091122]">
                      72%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4 font-medium">
                  Awaiting final review across pastoral zones
                </p>
              </div>

              {/* Card 2: Warm Pale Yellow */}
              <div className="bg-[#fef08a]/70 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold text-[#091122] tracking-tight">
                    19
                  </h2>
                  <p className="text-sm font-bold text-[#1e293b] mt-0.5">
                    Active Campaigns
                  </p>
                  <div className="inline-flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 mt-2 shadow-2xs">
                    <span>+7.2%</span>
                    <span className="font-normal text-slate-600">growth</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4 font-medium">
                  Based on submission volume from Lagos & regional branches
                </p>
              </div>

              {/* Card 3: Dark Graphic AI / Optimization Card */}
              <div className="bg-[#0f172a] text-white rounded-[28px] p-6 shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
                {/* Glowing graphic overlay */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/50 inline-block mb-2">
                    AI Insight
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Optimize Your Submission Workflows
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Identify trends and bottle-necks in real-time.
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex items-center justify-between">
                  <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5">
                    <span>Learn More</span>
                    <span className="text-[10px]">▶</span>
                  </button>
                  <div className="w-12 h-12 rounded-full border border-cyan-400/30 flex items-center justify-center bg-cyan-950/30">
                    <Sparkles className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Lower Section: Main Graph (Left) & Info Cards Stack (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Main Graph Container (8 cols) */}
              <div className="lg:col-span-8 bg-white/80 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-white/80 shadow-xs flex flex-col justify-between min-h-[440px]">
                {/* Graph Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#091122]">
                      Form Engagement Overview
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tracking applicant momentum and approval cycle length
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Submissions vs Completion Rate */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-semibold">
                      <button
                        onClick={() => setGraphTab("submissions")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${
                          graphTab === "submissions"
                            ? "bg-white text-[#091122] shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Active Submissions
                      </button>
                      <button
                        onClick={() => setGraphTab("completion")}
                        className={`px-3 py-1.5 rounded-xl transition-all ${
                          graphTab === "completion"
                            ? "bg-white text-[#091122] shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Completion Rate
                      </button>
                    </div>

                    {/* Year Selector */}
                    <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-[#091122] flex items-center gap-1 cursor-pointer">
                      <span>{year}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Graph Visual: Pill-bars with Dotted Line overlay */}
                <div className="relative h-64 w-full flex items-end justify-between px-2 pt-10">
                  {/* Dotted Trend Curve SVG Connection */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    viewBox="0 0 800 240"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 50 160 Q 150 140 250 85 T 450 70 T 650 45 T 750 140"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                      className="opacity-60"
                    />
                  </svg>

                  {/* Vertical Pill Bars */}
                  {pillData.map((item, idx) => {
                    const isSelected = selectedPill === idx;
                    return (
                      <div
                        key={item.label}
                        onClick={() => setSelectedPill(idx)}
                        className="flex flex-col items-center gap-2 group cursor-pointer relative z-20"
                      >
                        {/* Percentage Dot Indicator */}
                        <div
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            isSelected
                              ? "bg-[#091122] text-white shadow-md scale-110"
                              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                          }`}
                        >
                          {item.dotPercent}
                        </div>

                        {/* Pill Bar Container */}
                        <div className="w-9 md:w-12 h-44 bg-slate-100/90 rounded-full p-1 flex flex-col justify-end transition-all group-hover:bg-slate-200/90">
                          {/* Inner Filled Pill */}
                          <div
                            style={{ height: item.height }}
                            className={`w-full rounded-full transition-all duration-500 ${
                              isSelected
                                ? "bg-[#091122] shadow-md"
                                : "bg-[#1e293b]/85 group-hover:bg-[#091122]"
                            }`}
                          ></div>
                        </div>

                        {/* Month Label */}
                        <span className="text-xs font-semibold text-slate-500 mt-1">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#091122]"></span>
                      Completed Sessions
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      Open Inquiries
                    </span>
                  </div>
                  <span className="font-semibold text-slate-500">
                    Average turnaround: 3.4 days
                  </span>
                </div>
              </div>

              {/* Right Stack of 5 Info Cards (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {infoCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.id}
                      href={card.href}
                      className="group bg-white/80 hover:bg-white backdrop-blur-md rounded-[22px] p-3.5 px-4 border border-white/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#091122] group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {card.desc}
                          </p>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
export default MakeStyleDashboard;
