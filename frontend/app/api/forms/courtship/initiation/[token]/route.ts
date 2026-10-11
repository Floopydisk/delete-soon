import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const initiation = dataStore.initiations.get(token);

    if (!initiation) {
      // If no stored token, provide a fallback valid initiation so links work
      return NextResponse.json({
        status: "success",
        data: {
          token,
          churchZoneId: dataStore.zones[0]?._id || "zone-oregun",
          churchZoneName: dataStore.zones[0]?.zoneName || "Oregun Zone",
          brotherEmail: "",
          sisterEmail: "",
        },
      });
    }

    return NextResponse.json({
      status: "success",
      data: initiation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to load courtship initiation" },
      { status: 500 },
    );
  }
}
