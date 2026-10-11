"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Eye, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApiUrl } from "@/lib/api-url";

// API URL
const API_BASE_URL = getApiUrl();

interface Submission {
  _id: string;
  formType: string;
  submittedBy?: {
    _id: string;
    name: string;
  };
  submitterName?: string;
  createdAt: string;
  status: string;
  details: Record<string, unknown>;
}

// Helper function to get the auth token
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
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();

      if (!authToken) {
        setError("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/forms/submissions`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          setError("You don't have permission to view submissions.");
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

      // Process and combine the different form types with safe access
      const allSubmissions: Submission[] = [
        ...(data.data.namingDedication || []).map((form: any) => ({
          _id: form._id,
          formType: "Naming & Dedication",
          submittedBy: form.submittedBy,
          submitterName:
            form.fatherName && form.motherName
              ? `${form.fatherName} & ${form.motherName}`
              : form.fatherName || form.motherName || "Unknown",
          createdAt: form.createdAt,
          status: form.status,
          details: form,
        })),
        ...(data.data.courtship || []).map((form: any) => ({
          _id: form._id,
          formType: "Courtship",
          submittedBy: form.submittedBy,
          submitterName:
            form.brotherName && form.sisterName
              ? `${form.brotherName} & ${form.sisterName}`
              : form.brotherName || form.sisterName || "Unknown",
          createdAt: form.createdAt,
          status: form.status,
          details: form,
        })),
        ...(data.data.burial || []).map((form: any) => ({
          _id: form._id,
          formType: "Burial Request",
          submittedBy: form.submittedBy,
          submitterName: form.fullNameOfDeceased || "Unknown",
          createdAt: form.createdAt,
          status: form.status,
          details: form,
        })),
      ];

      // Sort by date, newest first
      allSubmissions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setSubmissions(allSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleStatusChange = async (
    submissionId: string,
    formType: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingId(submissionId);

      // Determine the API endpoint based on form type
      let endpoint = "";
      switch (formType) {
        case "Naming & Dedication":
          endpoint = `${API_BASE_URL}/api/forms/naming-dedication/${submissionId}/status`;
          break;
        case "Courtship":
          endpoint = `${API_BASE_URL}/api/forms/courtship/${submissionId}/status`;
          break;
        case "Burial Request":
          endpoint = `${API_BASE_URL}/api/forms/burial/${submissionId}/status`;
          break;
        default:
          throw new Error("Unknown form type");
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

      // Update the local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId ? { ...sub, status: newStatus } : sub,
        ),
      );

      toast({
        title: "Status Updated",
        description: `Form status has been updated to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
      case "completed":
        return "outline";
      case "rejected":
        return "destructive";
      case "in_counseling":
        return "secondary";
      default:
        return "default";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={fetchSubmissions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Submissions</CardTitle>
          <Button
            onClick={fetchSubmissions}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading submissions...
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="font-mono text-xs">
                        {submission._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{submission.formType}</TableCell>
                      <TableCell>
                        {submission.submittedBy?.name ||
                          submission.submitterName}
                      </TableCell>
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(submission.status)}
                        >
                          {submission.status.charAt(0).toUpperCase() +
                            submission.status.slice(1).replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </Button>
                      </TableCell>
                      <TableCell>
                        {updatingId === submission._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Select
                            defaultValue={submission.status}
                            onValueChange={(value) =>
                              handleStatusChange(
                                submission._id,
                                submission.formType,
                                value,
                              )
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="in_counseling">
                                In Counseling
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.formType} submission details
            </DialogTitle>
            <DialogDescription>
              Complete record for{" "}
              {selectedSubmission?.submitterName || "submission"}.
            </DialogDescription>
          </DialogHeader>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-5 whitespace-pre-wrap break-words">
            {selectedSubmission
              ? JSON.stringify(selectedSubmission.details, null, 2)
              : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
