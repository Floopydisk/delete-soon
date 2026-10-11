import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function POST(request: Request) {
  try {
    const { churchZoneId, brotherEmail, sisterEmail } = await request.json();

    const token = `init_${Math.random().toString(36).substring(2, 10)}`;
    const zone = dataStore.zones.find((z: any) => z._id === churchZoneId);

    const initiationData = {
      token,
      churchZoneId,
      churchZoneName: zone?.zoneName || "Daystar Centre",
      brotherEmail,
      sisterEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    };

    dataStore.initiations.set(token, initiationData);

    const completionUrl = `/forms/courtship?token=${token}`;

    return NextResponse.json({
      status: "success",
      message: "Courtship form initiation link generated",
      data: {
        token,
        completionUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to initiate courtship form" },
      { status: 500 },
    );
  }
}
