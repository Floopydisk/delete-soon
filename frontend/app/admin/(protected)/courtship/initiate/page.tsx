"use client";

import { FormEvent, useEffect, useState } from "react";
import { Link as LinkIcon, Mail, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiUrl } from "@/lib/api-url";

interface ChurchZone {
  _id: string;
  zoneName: string;
}

export default function InitiateCourtshipPage() {
  const [zones, setZones] = useState<ChurchZone[]>([]);
  const [churchZoneId, setChurchZoneId] = useState("");
  const [brotherEmail, setBrotherEmail] = useState("");
  const [sisterEmail, setSisterEmail] = useState("");
  const [completionUrl, setCompletionUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = getApiUrl();

  useEffect(() => {
    const loadZones = async () => {
      const response = await fetch(
        `${backendUrl}/api/church-zones/get-all-zones`,
      );
      if (response.ok) {
        const data = await response.json();
        setZones(data.data.zones);
      } else {
        setError("Unable to load church zones. Please try again.");
      }
    };
    loadZones().catch(() =>
      setError("Unable to load church zones. Please try again."),
    );
  }, [backendUrl]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCompletionUrl("");
    const token = window.localStorage.getItem("daystar_token");
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/forms/courtship/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ churchZoneId, brotherEmail, sisterEmail }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to initiate the form.");
      setCompletionUrl(data.data.completionUrl);
    } catch (requestError: any) {
      setError(requestError.message || "Unable to initiate the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Initiate a
            Courtship Form
          </CardTitle>
          <CardDescription>
            Select your zone and enter the applicant email addresses. A secure,
            14-day completion link will be emailed to them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Church Zone *</Label>
              <Select
                value={churchZoneId}
                onValueChange={setChurchZoneId}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your church zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone._id} value={zone._id}>
                      {zone.zoneName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brotherEmail">Brother&apos;s email</Label>
                <Input
                  id="brotherEmail"
                  type="email"
                  value={brotherEmail}
                  onChange={(event) => setBrotherEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sisterEmail">Sister&apos;s email</Label>
                <Input
                  id="sisterEmail"
                  type="email"
                  value={sisterEmail}
                  onChange={(event) => setSisterEmail(event.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              At least one applicant email is required.
            </p>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting || !churchZoneId || (!brotherEmail && !sisterEmail)
              }
            >
              <Mail className="mr-2 h-4 w-4" />{" "}
              {isSubmitting ? "Sending…" : "Send completion link"}
            </Button>
          </form>
          {completionUrl && (
            <Alert className="mt-6 border-green-300 bg-green-50">
              <LinkIcon className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p>
                  The invitation was sent. You can also copy this secure
                  completion link.
                </p>
                <div className="flex gap-2">
                  <Input value={completionUrl} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(completionUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
