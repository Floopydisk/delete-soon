import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newForm = {
      _id: `br-${Date.now()}`,
      formId: body.formId || `burial_${Date.now()}`,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.burial.unshift(newForm);

    dataStore.notifications.unshift({
      _id: `notif-${Date.now()}`,
      recipientEmail: "pastorate@daystarng.org",
      recipientName: "Daystar Pastoral Team",
      subject: `New Burial Request - ${newForm.fullNameOfDeceased || "Deceased"}`,
      message: `A new burial support request has been submitted for ${newForm.fullNameOfDeceased}.`,
      formType: "burial",
      formId: newForm._id,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Burial request form submitted successfully",
        data: { form: newForm },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to submit burial request" },
      { status: 500 },
    );
  }
}
