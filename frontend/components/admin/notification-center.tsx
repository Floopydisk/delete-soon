"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-url";

const API_BASE_URL = getApiUrl();

interface Notification {
  _id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
  formType: string;
  formId: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  recent: number;
}

const getAuthToken = (): string => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("daystar_token") ||
      localStorage.getItem("authToken") ||
      ""
    );
  }
  return "";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingPending, setIsSendingPending] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/statistics/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data?.statistics || null);
      }
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const handleSendCustomNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          subject,
          message: customMessage,
          formType: "naming_dedication", // Default type for custom notifications
          formId: `custom_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      toast({
        title: "Success",
        description: "Notification created successfully!",
      });

      // Reset form
      setCustomMessage("");
      setSubject("");
      setSelectedZone("");
      setRecipientEmail("");
      setRecipientName("");

      // Refresh notifications list
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPendingNotifications = async () => {
    setIsSendingPending(true);
    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/send-pending`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send pending notifications");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `Processed ${
          data.data?.processed || 0
        } pending notifications.`,
      });

      // Refresh data
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error("Failed to send pending notifications:", error);
      toast({
        title: "Error",
        description: "Failed to send pending notifications.",
        variant: "destructive",
      });
    } finally {
      setIsSendingPending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.sent}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Custom Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Custom Notification
          </CardTitle>
          <CardDescription>
            Send a custom message to pastors and coordinators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCustomNotification} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Pastor John"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="pastor@daystar.org"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone">Church Zone (Optional)</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zone A - Victoria Island">
                      Zone A - Victoria Island
                    </SelectItem>
                    <SelectItem value="Zone B - Ikeja">
                      Zone B - Ikeja
                    </SelectItem>
                    <SelectItem value="Zone C - Lekki">
                      Zone C - Lekki
                    </SelectItem>
                    <SelectItem value="Zone D - Surulere">
                      Zone D - Surulere
                    </SelectItem>
                    <SelectItem value="all">All Zones</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Notification subject"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification History
            </CardTitle>
            <CardDescription>
              Recent automatic and manual notifications
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendPendingNotifications}
              disabled={isSendingPending || (stats?.pending || 0) === 0}
            >
              {isSendingPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Pending ({stats?.pending || 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found. Notifications will appear here when forms
              are submitted.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="capitalize">
                      {notification.formType.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {notification.recipientName || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.recipientEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {notification.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(notification.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
