"use client";

import { SubmissionList } from "@/components/admin/submission-list";

export default function SubmissionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Form Submissions</h1>
      <SubmissionList />
    </div>
  );
}