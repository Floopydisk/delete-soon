"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Heart,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-url";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = getApiUrl();

interface Submission {
  _id: string;
  formType: string;
  submittedBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  submitterName?: string;
  submitterEmail?: string;
  createdAt: string;
  status: string;
  details: Record<string, any>;
}

const getAuthToken = (): string => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("daystar_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      ""
    );
  }
  return "";
};

export function SubmissionList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/forms/submissions`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to fetch submissions. Please try again.");
        }
        return;
      }

      const data = await response.json();
      if (!data.data) {
        setSubmissions([]);
        return;
      }

      const allSubmissions: Submission[] = [
        ...(data.data.namingDedication || []).map((form: any) => ({
          _id: form._id,
          formType: "Naming & Dedication",
          submittedBy: form.submittedBy,
          submitterName:
            form.fatherName && form.motherName
              ? `${form.fatherName} & ${form.motherName}`
              : form.fatherName || form.motherName || "Parent",
          submitterEmail: form.fatherEmail || form.email || "",
          createdAt: form.createdAt || new Date().toISOString(),
          status: form.status || "pending",
          details: form,
        })),
        ...(data.data.courtship || []).map((form: any) => ({
          _id: form._id,
          formType: "Courtship Mentoring",
          submittedBy: form.submittedBy,
          submitterName:
            form.brother && form.sister
              ? `${form.brother.firstName} & ${form.sister.firstName}`
              : "Couple",
          submitterEmail: form.brother?.email || form.sister?.email || "",
          createdAt: form.createdAt || new Date().toISOString(),
          status: form.status || "pending",
          details: form,
        })),
        ...(data.data.burial || []).map((form: any) => ({
          _id: form._id,
          formType: "Burial Request",
          submittedBy: form.submittedBy,
          submitterName: form.fullNameOfDeceased || "Deceased",
          submitterEmail: form.contactEmail || "",
          createdAt: form.createdAt || new Date().toISOString(),
          status: form.status || "pending",
          details: form,
        })),
      ];

      allSubmissions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setSubmissions(allSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("An unexpected error occurred while loading submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      setUpdatingId(submissionId);
      const submission = submissions.find((s) => s._id === submissionId);
      if (!submission) return;

      let endpoint = "";
      switch (submission.formType) {
        case "Naming & Dedication":
          endpoint = `${API_BASE_URL}/api/forms/naming-dedication/${submissionId}/status`;
          break;
        case "Courtship Mentoring":
          endpoint = `${API_BASE_URL}/api/forms/courtship/${submissionId}/status`;
          break;
        case "Burial Request":
          endpoint = `${API_BASE_URL}/api/forms/burial/${submissionId}/status`;
          break;
        default:
          endpoint = `${API_BASE_URL}/api/forms/submissions/${submissionId}/status`;
      }

      const authToken = getAuthToken();
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId ? { ...sub, status: newStatus } : sub,
        ),
      );

      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast({
        title: "Status Updated",
        description: `Form status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Update Failed",
        description: "Could not update submission status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        searchQuery === "" ||
        sub.submitterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.formType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "courtship" && sub.formType === "Courtship Mentoring") ||
        (filterType === "naming" && sub.formType === "Naming & Dedication") ||
        (filterType === "burial" && sub.formType === "Burial Request");

      const matchesStatus =
        filterStatus === "all" || sub.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [submissions, searchQuery, filterType, filterStatus]);

  const counts = useMemo(() => {
    return {
      all: submissions.length,
      courtship: submissions.filter((s) => s.formType === "Courtship Mentoring").length,
      naming: submissions.filter((s) => s.formType === "Naming & Dedication").length,
      burial: submissions.filter((s) => s.formType === "Burial Request").length,
      pending: submissions.filter((s) => s.status === "pending").length,
      approved: submissions.filter((s) => s.status === "approved").length,
      completed: submissions.filter((s) => s.status === "completed").length,
    };
  }, [submissions]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Approved
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/80 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const getFormIcon = (type: string) => {
    if (type === "Courtship Mentoring") {
      return (
        <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4" />
        </span>
      );
    }
    if (type === "Naming & Dedication") {
      return (
        <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter & Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setFilterType("all");
            setFilterStatus("all");
          }}
          className={`cursor-pointer p-4 rounded-[24px] border backdrop-blur-md transition-all ${
            filterType === "all" && filterStatus === "all"
              ? "bg-[#091122] text-white border-white/20 shadow-md"
              : "bg-white/80 hover:bg-white text-slate-800 border-white/90 shadow-xs"
          }`}
        >
          <p className="text-xs font-medium opacity-70">Total Submissions</p>
          <p className="text-2xl font-extrabold mt-1">{counts.all}</p>
        </div>

        <div
          onClick={() => setFilterStatus("pending")}
          className={`cursor-pointer p-4 rounded-[24px] border backdrop-blur-md transition-all ${
            filterStatus === "pending"
              ? "bg-amber-500 text-white border-amber-600 shadow-md"
              : "bg-[#fef08a]/70 hover:bg-[#fef08a] text-[#091122] border-white/90 shadow-xs"
          }`}
        >
          <p className="text-xs font-medium opacity-80">Pending Action</p>
          <p className="text-2xl font-extrabold mt-1">{counts.pending}</p>
        </div>

        <div
          onClick={() => setFilterType("courtship")}
          className={`cursor-pointer p-4 rounded-[24px] border backdrop-blur-md transition-all ${
            filterType === "courtship"
              ? "bg-rose-600 text-white border-rose-700 shadow-md"
              : "bg-rose-50/80 hover:bg-rose-100 text-[#091122] border-white/90 shadow-xs"
          }`}
        >
          <p className="text-xs font-medium opacity-80">Courtship Forms</p>
          <p className="text-2xl font-extrabold mt-1">{counts.courtship}</p>
        </div>

        <div
          onClick={() => setFilterType("naming")}
          className={`cursor-pointer p-4 rounded-[24px] border backdrop-blur-md transition-all ${
            filterType === "naming"
              ? "bg-blue-600 text-white border-blue-700 shadow-md"
              : "bg-[#dbeafe]/80 hover:bg-[#dbeafe] text-[#091122] border-white/90 shadow-xs"
          }`}
        >
          <p className="text-xs font-medium opacity-80">Child Naming</p>
          <p className="text-2xl font-extrabold mt-1">{counts.naming}</p>
        </div>
      </div>

      {/* Main Table Card (Liquid Glass Aesthetic) */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-white/90 shadow-xs">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          {/* Form Type Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Forms", count: counts.all },
              { id: "courtship", label: "Marriage Mentoring", count: counts.courtship },
              { id: "naming", label: "Naming & Dedication", count: counts.naming },
              { id: "burial", label: "Burial Request", count: counts.burial },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? "bg-white text-[#091122] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicants, ID..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white rounded-xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-2xs"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Submissions List / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-rose-900">{error}</p>
            <button
              onClick={fetchSubmissions}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <h4 className="font-bold text-slate-700 text-sm">No submissions found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? `No submissions matched "${searchQuery}"`
                : "No applicants have submitted this form type yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Form Type</th>
                  <th className="pb-3 px-3">Applicant / Subject</th>
                  <th className="pb-3 px-3">Submitted</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredSubmissions.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        {getFormIcon(sub.formType)}
                        <div>
                          <p className="font-bold text-[#091122] text-xs">
                            {sub.formType}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            #{sub._id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-800 text-xs">
                        {sub.submitterName}
                      </p>
                      {sub.submitterEmail && (
                        <p className="text-[11px] text-slate-400">
                          {sub.submitterEmail}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-500 font-medium">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                      {renderStatusBadge(sub.status)}
                    </td>

                    <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Status Select */}
                        <select
                          value={sub.status}
                          disabled={updatingId === sub._id}
                          onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none cursor-pointer transition-colors"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="completed">Complete</option>
                          <option value="rejected">Reject</option>
                        </select>

                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Details Modal Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl rounded-[32px] p-6 border border-white shadow-2xl max-h-[85vh] overflow-y-auto">
          {selectedSubmission && (
            <div>
              <DialogHeader className="mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedSubmission.formType}
                    </span>
                    <DialogTitle className="text-xl font-extrabold text-[#091122] mt-1">
                      {selectedSubmission.submitterName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Submitted on {formatDate(selectedSubmission.createdAt)}
                    </DialogDescription>
                  </div>
                  <div>{renderStatusBadge(selectedSubmission.status)}</div>
                </div>
              </DialogHeader>

              {/* Status Update Quick Action Inside Modal */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Review Decision</p>
                  <p className="text-[11px] text-slate-500">
                    Update pastoral approval status
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {["pending", "approved", "completed", "rejected"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedSubmission._id, st)}
                      disabled={updatingId === selectedSubmission._id}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                        selectedSubmission.status === st
                          ? "bg-[#091122] text-white shadow-xs"
                          : "bg-white hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Form Details Summary */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Form Record Payload
                </h4>

                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                  {Object.entries(selectedSubmission.details)
                    .filter(
                      ([key]) =>
                        !["__v", "updatedAt", "details", "submittedBy"].includes(key),
                    )
                    .map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/50 last:border-none"
                      >
                        <span className="font-semibold text-slate-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-bold text-slate-900 break-all sm:text-right">
                          {typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val || "—")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubmissionList;
