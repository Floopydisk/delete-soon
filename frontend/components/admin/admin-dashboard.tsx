"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Heart,
  Users,
  Bell,
  BarChart3,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { LoadingSpinner } from "../ui/loading-spinner";
import { getApiUrl } from "@/lib/api-url";

const API_BASE_URL = getApiUrl();

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case "in_counseling":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          <Users className="w-3 h-3 mr-1" />
          In Counseling
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [submissions, setSubmissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token =
          localStorage.getItem("daystar_token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          "";
        const res = await fetch(`${API_BASE_URL}/api/forms/submissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setSubmissions(data.data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleApproveForm = (formId: number, formType: string) => {
    console.log(`Approving ${formType} form ${formId}`);
    // Here you would call your API to approve the form
    alert(`${formType} form ${formId} has been approved!`);
  };

  const handleViewForm = (formId: number, formType: string) => {
    console.log(`Viewing ${formType} form ${formId}`);
    // Here you would navigate to the form details page
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalForms =
    submissions?.namingDedication?.length +
    submissions?.courtship?.length +
    submissions?.burial?.length;
  const pendingForms =
    submissions?.namingDedication?.filter(
      (form: any) => form.status === "pending",
    ).length +
    submissions?.courtship?.filter((form: any) => form.status === "pending")
      .length +
    submissions?.burial?.filter((form: any) => form.status === "pending")
      .length;
  const approvedForms =
    submissions?.namingDedication?.filter(
      (form: any) => form.status === "approved",
    ).length +
    submissions?.courtship?.filter((form: any) => form.status === "approved")
      .length +
    submissions?.burial?.filter((form: any) => form.status === "approved")
      .length;
  const completedForms =
    submissions?.namingDedication?.filter(
      (form: any) => form.status === "completed",
    ).length +
    submissions?.courtship?.filter((form: any) => form.status === "completed")
      .length +
    submissions?.burial?.filter((form: any) => form.status === "completed")
      .length;
  const namingForms = submissions?.namingDedication?.length;
  const courtshipForms = submissions?.courtship?.length;
  const burialForms = submissions?.burial?.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Family Life Ministries Portal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <a
                href="/"
                className="text-primary hover:text-primary/80 font-medium"
              >
                ← Back to Portal
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalForms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingForms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {approvedForms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedForms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Naming Forms
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {namingForms}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courtship Forms
              </CardTitle>
              <Heart className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {courtshipForms}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_counseling">In Counseling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Church Zone</Label>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Tables */}
        <Tabs defaultValue="naming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="naming">Naming & Dedication Forms</TabsTrigger>
            <TabsTrigger value="courtship">Courtship Forms</TabsTrigger>
            <TabsTrigger value="burial">Burial Request Forms</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="naming">
            <Card>
              <CardHeader>
                <CardTitle>Naming & Dedication Forms</CardTitle>
                <CardDescription>
                  Manage child naming and dedication ceremony requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parents</TableHead>
                      <TableHead>Baby Name</TableHead>
                      <TableHead>Ceremony Type</TableHead>
                      <TableHead>Church Zone</TableHead>
                      <TableHead>Intended Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions?.namingDedication?.map((form: any) => (
                      <TableRow key={form._id}>
                        <TableCell className="font-medium">
                          {form.fatherName} & {form.motherName}
                        </TableCell>
                        <TableCell>
                          {form.babies && form.babies.length > 0
                            ? form.babies.map((b: any) => b.name).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {form.ceremonyType.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {form.churchZoneId?.zoneName || "N/A"}
                        </TableCell>
                        <TableCell>
                          {form.intendedNamingDate
                            ? new Date(
                                form.intendedNamingDate,
                              ).toLocaleDateString()
                            : form.intendedDedicationDate
                              ? new Date(
                                  form.intendedDedicationDate,
                                ).toLocaleDateString()
                              : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(form.status)}</TableCell>
                        <TableCell>
                          {new Date(form.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewForm(form._id, "naming")
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {form.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApproveForm(form._id, "naming")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Notification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courtship">
            <Card>
              <CardHeader>
                <CardTitle>Courtship Forms</CardTitle>
                <CardDescription>
                  Manage marriage mentoring program applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brother</TableHead>
                      <TableHead>Sister</TableHead>
                      <TableHead>Church Zone</TableHead>
                      <TableHead>Counselor</TableHead>
                      <TableHead>Proposed Wedding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions?.courtship?.map((form: any) => (
                      <TableRow key={form._id}>
                        <TableCell className="font-medium">
                          {form.brotherName}
                        </TableCell>
                        <TableCell>{form.sisterName}</TableCell>
                        <TableCell>
                          {form.churchZoneId?.zoneName || "N/A"}
                        </TableCell>
                        <TableCell>
                          {form.supervisingCounselor || "N/A"}
                        </TableCell>
                        <TableCell>
                          {form.proposedWeddingDate
                            ? new Date(
                                form.proposedWeddingDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(form.status)}</TableCell>
                        <TableCell>
                          {new Date(form.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewForm(form._id, "courtship")
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {form.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApproveForm(form._id, "courtship")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Notification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burial">
            <Card>
              <CardHeader>
                <CardTitle>Burial Request Forms</CardTitle>
                <CardDescription>Manage burial requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deceased Name</TableHead>
                      <TableHead>Zonal Coordinator</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions?.burial?.map((form: any) => (
                      <TableRow key={form._id}>
                        <TableCell className="font-medium">
                          {form.fullNameOfDeceased}
                        </TableCell>
                        <TableCell>{form.zonalCoordinator || "N/A"}</TableCell>
                        <TableCell>{form.zone || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(form.status)}</TableCell>
                        <TableCell>
                          {new Date(form.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewForm(form._id, "burial")
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {form.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApproveForm(form._id, "burial")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Notification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest form submissions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    New naming form submitted
                  </p>
                  <p className="text-xs text-muted-foreground">
                    John & Mary Adebayo - Zone A
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <Heart className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Courtship form approved</p>
                  <p className="text-xs text-muted-foreground">
                    Daniel & Esther - Zone D
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">5 hours ago</div>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Dedication ceremony completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Michael & Faith Johnson - Zone C
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
