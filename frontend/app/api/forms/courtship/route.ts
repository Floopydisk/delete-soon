import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newForm = {
      _id: `ct-${Date.now()}`,
      formId: body.formId || `courtship_${Date.now()}`,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.courtship.unshift(newForm);

    dataStore.notifications.unshift({
      _id: `notif-${Date.now()}`,
      recipientEmail: "marriage.ministry@daystarng.org",
      recipientName: "Marriage Mentoring Programme",
      subject: `New Courtship Registration - ${newForm.brother?.firstName || "Brother"} & ${newForm.sister?.firstName || "Sister"}`,
      message: `A new courtship registration has been submitted and is awaiting review.`,
      formType: "courtship",
      formId: newForm._id,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Courtship form submitted successfully",
        data: { form: newForm },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to submit courtship form" },
      { status: 500 },
    );
  }
}
