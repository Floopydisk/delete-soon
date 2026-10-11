import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newForm = {
      _id: `nd-${Date.now()}`,
      formId: body.formId || `naming_${Date.now()}`,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.namingDedication.unshift(newForm);

    // Also add to notifications
    dataStore.notifications.unshift({
      _id: `notif-${Date.now()}`,
      recipientEmail: "pastorate@daystarng.org",
      recipientName: "Daystar Pastoral Team",
      subject: `New Naming & Dedication Form - ${newForm.fatherName || "Family"}`,
      message: `A new naming dedication request has been submitted.`,
      formType: "naming_dedication",
      formId: newForm._id,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Naming dedication form submitted successfully",
        data: { form: newForm },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to submit form" },
      { status: 500 },
    );
  }
}
