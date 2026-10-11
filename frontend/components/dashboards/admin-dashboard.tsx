import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Heart, Users, Clock, TrendingUp, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage form submissions, users, and church operations.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">156</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">89</div>
            <p className="text-xs text-muted-foreground">+5 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">43</div>
            <p className="text-xs text-muted-foreground">+18 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Pending Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Review and approve pending form submissions.</p>
            <Link href="/admin/submissions">
              <Button className="w-full">Review Forms</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage user accounts and permissions.</p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Reports & Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">View detailed reports and analytics.</p>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full bg-transparent">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest form submissions and system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New Naming & Dedication form submitted</p>
                <p className="text-xs text-muted-foreground">John & Mary Smith • Zone A • 2 hours ago</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-accent/10 rounded-full">
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Courtship form requires review</p>
                <p className="text-xs text-muted-foreground">David & Sarah Johnson • Zone B • 4 hours ago</p>
              </div>
              <Clock className="w-4 h-4 text-accent" />
            </div>

            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Dedication ceremony scheduled</p>
                <p className="text-xs text-muted-foreground">Baby Grace Wilson • Zone C • 6 hours ago</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
