"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Church,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReportsDashboard() {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState("2025");

  const zonePerformance = [
    { zone: "Oregun Central", total: 240, completed: 215, rate: "89%", speed: "2.1 days" },
    { zone: "Lekki Pastoral Region", total: 195, completed: 178, rate: "91%", speed: "1.8 days" },
    { zone: "Ikorodu Zone", total: 110, completed: 92, rate: "84%", speed: "3.2 days" },
    { zone: "Alimosho Zone", total: 85, completed: 76, rate: "89%", speed: "2.5 days" },
    { zone: "Ikeja Zone", total: 72, completed: 65, rate: "90%", speed: "2.0 days" },
    { zone: "Victoria Island", total: 64, completed: 59, rate: "92%", speed: "1.6 days" },
  ];

  const exportReport = (format: string) => {
    toast({
      title: "Export Initiated",
      description: `Generating ${format.toUpperCase()} summary report for all pastoral zones...`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#dbeafe]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Overall Completion Rate
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">89.4%</p>
          <p className="text-xs text-slate-600 mt-1">+4.2% increase across all zones</p>
        </div>

        <div className="bg-[#fef08a]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            Average Turnaround Time
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">2.2 Days</p>
          <p className="text-xs text-slate-700 mt-1">From submission to pastoral review</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Audited Records
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">766</p>
          <p className="text-xs text-slate-500 mt-1">Verified pastoral submissions</p>
        </div>
      </div>

      {/* Main Liquid Glass Report Table Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-white/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#091122]">
              Zonal Form Turnaround & Audit Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Performance metrics for Daystar worship centres and regional directorates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReport("csv")}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportReport("pdf")}
              className="px-3.5 py-2 rounded-xl bg-[#091122] hover:bg-[#1a2942] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Pastoral Zone</th>
                <th className="pb-3 px-3">Total Submissions</th>
                <th className="pb-3 px-3">Completed</th>
                <th className="pb-3 px-3">Completion Rate</th>
                <th className="pb-3 px-3">Avg. Review Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {zonePerformance.map((row) => (
                <tr key={row.zone} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 text-[#091122] flex items-center justify-center font-bold text-xs shrink-0">
                        <Church className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-[#091122] text-xs">
                        {row.zone}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-xs font-semibold text-slate-700">
                    {row.total}
                  </td>
                  <td className="py-4 px-3 text-xs font-semibold text-emerald-700">
                    {row.completed}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{row.rate}</span>
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: row.rate }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-xs font-semibold text-slate-600">
                    {row.speed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;
