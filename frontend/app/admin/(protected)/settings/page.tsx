"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  Database,
  Shield,
  Church,
  Save,
  CheckCircle2,
  Sparkles,
  Sliders,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pastoralReviewRequired, setPastoralReviewRequired] = useState(true);
  const [autoArchiveDays, setAutoArchiveDays] = useState("90");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({
      title: "Settings Saved",
      description: "Portal configuration updated successfully.",
    });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Settings Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Card 1: Notification & Pastoral Alerts */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#091122] text-sm">
                  Notification Triggers
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant pastoral and coordinator alert routing
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Email Regional Pastors on Submission
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Notify officiating minister immediately
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-[#091122]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Two-Stage Signatory Verification
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Require both coordinator and pastor approval
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pastoralReviewRequired}
                  onChange={(e) => setPastoralReviewRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-[#091122]"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Status: Active & Listening
            </span>
          </div>
        </div>

        {/* Card 2: Church Zones & Routing */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Church className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#091122] text-sm">
                  Pastoral Zones & Routing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Manage Daystar regions (Oregun, Lekki, Ikorodu, etc.)
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="font-semibold text-slate-600">Active Church Zones</span>
                <span className="font-extrabold text-[#091122]">6 Zones Configured</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="font-semibold text-slate-600">Primary Hub</span>
                <span className="font-extrabold text-blue-600">Oregun Central</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-600">Approval Grace Period</span>
                <span className="font-extrabold text-[#091122]">14 Days</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <span className="text-[11px] text-slate-500">
              Zones update automatically when coordinators are assigned.
            </span>
          </div>
        </div>

        {/* Card 3: Email Notification Templates */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#091122] text-sm">
                  Email Templates & Branding
                </h3>
                <p className="text-[11px] text-slate-500">
                  Custom dispatch messages for approved forms
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Templates for Courtship Invitations, Baby Dedication Confirmations,
              and Funeral Pastoral Care letters include Daystar official letterhead and
              verification tokens.
            </p>
          </div>

          <button
            onClick={() =>
              toast({
                title: "Template Editor",
                description: "Official Daystar church letterheads are synchronized.",
              })
            }
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#091122] font-bold text-xs transition-colors"
          >
            Review Templates
          </button>
        </div>

        {/* Card 4: Security & Access Control */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-white/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#091122] text-sm">
                  Security & Role Policies
                </h3>
                <p className="text-[11px] text-slate-500">
                  JWT session lifetimes and admin privileges
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Session Expiry Window
                </label>
                <select
                  value={autoArchiveDays}
                  onChange={(e) => setAutoArchiveDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="7">7 Days Session Expiry</option>
                  <option value="30">30 Days Session Expiry</option>
                  <option value="90">90 Days Session Expiry</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#091122] hover:bg-[#1a2942] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Security Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
