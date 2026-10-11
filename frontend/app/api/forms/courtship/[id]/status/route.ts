import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const form = dataStore.courtship.find((f: any) => f._id === id);
    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    form.status = status;
    form.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: form,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
