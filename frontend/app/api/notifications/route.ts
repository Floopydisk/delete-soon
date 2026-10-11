import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET() {
  return NextResponse.json({
    status: "success",
    data: {
      notifications: dataStore.notifications,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newNotif = {
      _id: `notif-${Date.now()}`,
      recipientEmail: body.recipientEmail || "pastorate@daystarng.org",
      recipientName: body.recipientName || "Pastoral Team",
      subject: body.subject || "Daystar Forms Notification",
      message: body.message || "New activity recorded.",
      formType: body.formType || "general",
      formId: body.formId || "",
      status: "sent" as const,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    dataStore.notifications.unshift(newNotif);

    return NextResponse.json(
      {
        status: "success",
        message: "Notification created",
        data: { notification: newNotif },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
