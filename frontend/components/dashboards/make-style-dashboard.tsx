"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Headphones,
  FileSpreadsheet,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Heart,
  Eye,
  RefreshCw,
} from "lucide-react";

interface MakeDashboardProps {
  user?: any;
  stats?: any;
  chartData?: any;
  recentActivity?: any;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MakeStyleDashboard({
  user,
  stats,
  chartData,
  recentActivity,
  onRefresh,
  isRefreshing,
}: MakeDashboardProps) {
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

  const totalActive = stats?.totals?.submissions ?? 683;
  const pendingCount = stats?.totals?.pending ?? 12;
  const completedCount = stats?.totals?.completed ?? 148;

  return (
    <div className="flex flex-col gap-6">
      {/* 3. Horizontal Content Tabs Section (Below Header) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all relative ${
                activeTab === tab
                  ? "text-[#091122]"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-[#091122] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* View toggle & refresh button */}
        <div className="hidden sm:flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 transition-all shadow-2xs border border-white"
              title="Refresh live data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
          )}
          <button
            onClick={() => setShowImageMockup(!showImageMockup)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-white shadow-2xs transition-all"
          >
            {showImageMockup ? "Interactive Mode" : "View Design Mockup"}
          </button>
        </div>
      </div>

      {showImageMockup ? (
        /* Image Mockup Inspector */
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-6 shadow-xl border border-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Pixel-Perfect Design Architecture Mockup
              </h3>
              <p className="text-xs text-slate-500">
                Generated strictly based on reference layout specifications
              </p>
            </div>
            <button
              onClick={() => setShowImageMockup(false)}
              className="text-xs bg-[#091122] text-white px-3.5 py-2 rounded-xl font-medium shadow-xs"
            >
              Return to Live Interactive UI
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
        <>
          {/* 4. Summary Cards (3 cards row) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 (Left - Light lavender/blue): Total Active Forms */}
            <div className="bg-[#dbeafe]/75 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold text-[#091122] tracking-tight">
                    {totalActive}
                  </h2>
                  <p className="text-sm font-bold text-[#1e293b] mt-0.5">
                    Active Forms
                  </p>
                  <div className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 mt-2.5 shadow-2xs">
                    <span>+3.1%</span>
                    <span className="font-normal text-slate-600">this week</span>
                  </div>
                </div>

                {/* Circular usage metric gauge */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-blue-200/90"
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
                Awaiting final review across pastoral zones ({pendingCount} pending)
              </p>
            </div>

            {/* Card 2 (Middle - Yellow): Total Campaign Types */}
            <div className="bg-[#fef08a]/80 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold text-[#091122] tracking-tight">
                    19
                  </h2>
                  <p className="text-sm font-bold text-[#1e293b] mt-0.5">
                    Active Campaigns
                  </p>
                  <div className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 mt-2.5 shadow-2xs">
                    <span>+7.2%</span>
                    <span className="font-normal text-slate-600">growth</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-400/30 flex items-center justify-center text-amber-900">
                  <TrendingUp className="w-6 h-6 text-amber-900" />
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-4 font-medium">
                Based on submission volume from Lagos & regional centres
              </p>
            </div>

            {/* Card 3 (Right - Dark Graphic): "Optimize Your Submission Workflows" */}
            <div className="bg-[#091122] text-white rounded-[28px] p-6 shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/50 inline-block mb-2">
                  AI Workflow Insight
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Optimize Your Submission Workflows
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Identify trends and bottle-necks in real-time.
                </p>
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between">
                <Link
                  href="/admin/management/submissions"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
                >
                  <span>Learn More</span>
                  <span className="text-[10px]">▶</span>
                </Link>
                <div className="w-11 h-11 rounded-full border border-cyan-400/30 flex items-center justify-center bg-cyan-950/40">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Lower Section: Main Graph (Left) & Right-Side Info Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Main Graph Container (8 cols) */}
            <div className="lg:col-span-8 bg-white/80 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-white/90 shadow-xs flex flex-col justify-between min-h-[440px]">
              {/* Graph Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#091122]">
                    Form Engagement Overview
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Tracking applicant momentum and approval cycle length
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Tabs: Active Submissions & Completion Rate */}
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

              {/* Vertical Pill-Bar Graph with Dotted Line overlay */}
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
                    stroke="#091122"
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
                      {/* Data point dot & percentage badge */}
                      <div
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                          isSelected
                            ? "bg-[#091122] text-white shadow-md scale-110"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {item.dotPercent}
                      </div>

                      {/* Vertical Pill Bar Container */}
                      <div className="w-9 md:w-12 h-44 bg-slate-100/90 rounded-full p-1 flex flex-col justify-end transition-all group-hover:bg-slate-200/90">
                        {/* Filled inner pill */}
                        <div
                          style={{ height: item.height }}
                          className={`w-full rounded-full transition-all duration-500 ${
                            isSelected
                              ? "bg-[#091122] shadow-md"
                              : "bg-[#1e293b]/85 group-hover:bg-[#091122]"
                          }`}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="text-xs font-semibold text-slate-500 mt-1">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Graph Footer Indicators */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#091122]" />
                    Completed Form Workflows ({completedCount})
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    Pending Approvals ({pendingCount})
                  </span>
                </div>
                <span className="font-semibold text-slate-500">
                  Target response time: &lt; 48 hours
                </span>
              </div>
            </div>

            {/* 6. Right-Side Info Cards Stack (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="group bg-white/80 hover:bg-white backdrop-blur-md rounded-[24px] p-3.5 px-4 border border-white/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
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
                        <p className="text-[11px] text-slate-500 font-medium">
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

          {/* Form Types Quick Access Grid */}
          <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-white/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#091122]">
                  Live Ministry Forms Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Direct portals for marriage mentoring, baby dedication, and family support
                </p>
              </div>
              <Link
                href="/admin/management/submissions"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All Submissions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/forms/courtship"
                className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 hover:border-rose-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                    {stats?.forms?.courtship?.total ?? 2} Submissions
                  </span>
                </div>
                <h4 className="font-bold text-[#091122] text-sm group-hover:text-rose-600 transition-colors">
                  Marriage Mentoring Programme
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Couple bio-data, wedding target dates & pastor approval
                </p>
              </Link>

              <Link
                href="/forms/naming-dedication"
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                    {stats?.forms?.namingDedication?.total ?? 2} Submissions
                  </span>
                </div>
                <h4 className="font-bold text-[#091122] text-sm group-hover:text-blue-600 transition-colors">
                  Child Naming & Dedication
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Home naming & church sanctuary dedication schedules
                </p>
              </Link>

              <Link
                href="/forms/burial-request"
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100/60 border border-slate-200 hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#091122] text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                    {stats?.forms?.burialRequest?.total ?? 1} Submissions
                  </span>
                </div>
                <h4 className="font-bold text-[#091122] text-sm group-hover:text-slate-900 transition-colors">
                  Burial & Funeral Support
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Funeral service coordination & zonal pastor officiating
                </p>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default MakeStyleDashboard;
