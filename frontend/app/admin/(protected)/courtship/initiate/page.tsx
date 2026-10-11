"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Heart,
  Mail,
  ShieldCheck,
  Copy,
  Check,
  Send,
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";
import { getApiUrl } from "@/lib/api-url";
import { useToast } from "@/hooks/use-toast";

interface ChurchZone {
  _id: string;
  zoneName: string;
  regionalPastorName?: string;
}

export default function InitiateCourtshipPage() {
  const [zones, setZones] = useState<ChurchZone[]>([]);
  const [churchZoneId, setChurchZoneId] = useState("");
  const [brotherEmail, setBrotherEmail] = useState("");
  const [sisterEmail, setSisterEmail] = useState("");
  const [completionUrl, setCompletionUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const backendUrl = getApiUrl();

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/church-zones/get-all-zones`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.zones) {
            setZones(data.data.zones);
            if (data.data.zones.length > 0) {
              setChurchZoneId(data.data.zones[0]._id);
            }
          }
        }
      } catch (err) {
        console.error("Unable to load church zones:", err);
      }
    };
    loadZones();
  }, [backendUrl]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCompletionUrl("");

    const token =
      window.localStorage.getItem("daystar_token") ||
      window.localStorage.getItem("authToken");

    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/forms/courtship/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ churchZoneId, brotherEmail, sisterEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to initiate the form.");
      }
      setCompletionUrl(data.data.completionUrl);
      toast({
        title: "Campaign Initiated",
        description: "Secure courtship access link generated successfully.",
      });
    } catch (requestError: any) {
      setError(requestError.message || "Unable to initiate the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!completionUrl) return;
    const fullUrl = `${window.location.origin}${completionUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Form access link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Top Banner Card */}
      <div className="bg-[#091122] text-white rounded-[32px] p-6 md:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/30 mb-3">
              <Heart className="w-3.5 h-3.5" />
              <span>Marriage Mentoring Campaign</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Initiate Marriage Mentoring Form
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              Create an official application link for intending couples. Both the brother and
              sister will receive access to submit their profile photos and wedding target dates.
            </p>
          </div>

          <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-400 shrink-0">
            <Heart className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Liquid Glass Form Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-white/90 shadow-xs">
        <form onSubmit={submit} className="space-y-6">
          {/* Church Zone Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Assigned Pastoral Church Zone *
            </label>
            <select
              value={churchZoneId}
              onChange={(e) => setChurchZoneId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100/90 focus:bg-white rounded-2xl text-xs font-bold text-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer"
              required
            >
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.zoneName}{" "}
                  {zone.regionalPastorName ? `— (${zone.regionalPastorName})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              The assigned zonal pastor and coordinator will review the couple's submission.
            </p>
          </div>

          {/* Couple Emails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Brother&apos;s Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={brotherEmail}
                  onChange={(e) => setBrotherEmail(e.target.value)}
                  placeholder="e.g. brother@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100/90 focus:bg-white rounded-2xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Sister&apos;s Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={sisterEmail}
                  onChange={(e) => setSisterEmail(e.target.value)}
                  placeholder="e.g. sister@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-100/90 focus:bg-white rounded-2xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            * At least one valid applicant email address is required to generate the invitation.
          </p>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || !churchZoneId || (!brotherEmail && !sisterEmail)}
            className="w-full bg-[#091122] hover:bg-[#1a2942] disabled:opacity-50 text-white py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-navy-900/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Generating Link…" : "Generate Campaign Link"}</span>
          </button>
        </form>

        {/* Completion URL Result Box */}
        {completionUrl && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  Access Link Ready
                </h4>
              </div>
              <p className="text-xs text-emerald-800 mb-3">
                This secure token link gives the couple direct access to fill the Marriage Mentoring form:
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}${completionUrl}`
                      : completionUrl
                  }
                  className="flex-1 px-3 py-2.5 bg-white rounded-xl text-xs font-mono text-slate-700 border border-emerald-200 outline-none"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
