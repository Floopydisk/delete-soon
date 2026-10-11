import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Database, Shield } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Configure system settings and preferences.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure how and when notifications are sent to pastors and coordinators.
            </p>
            <Button variant="outline" className="w-full bg-transparent">
              Configure Notifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              <CardTitle>Email Templates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize email templates for different form types and notifications.
            </p>
            <Button variant="outline" className="w-full bg-transparent">
              Edit Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Backup, export, and manage form submission data.</p>
            <Button variant="outline" className="w-full bg-transparent">
              Manage Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure user permissions, access controls, and security policies.
            </p>
            <Button variant="outline" className="w-full bg-transparent">
              Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
