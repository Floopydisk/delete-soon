import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const zones = dataStore.zones;
  const totalCount = zones.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedZones = zones.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    status: "success",
    data: {
      zones: paginatedZones,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newZone = {
      _id: `zone-${Date.now()}`,
      zoneName: body.zoneName || "New Zone",
      regionalPastorName: body.regionalPastorName || "",
      regionalPastorEmail: body.regionalPastorEmail || "",
      zonalCoordinatorName: body.zonalCoordinatorName || "",
      zonalCoordinatorEmail: body.zonalCoordinatorEmail || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dataStore.zones.push(newZone);

    return NextResponse.json(
      {
        status: "success",
        message: "Church zone created successfully",
        data: { zone: newZone },
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create zone" },
      { status: 500 },
    );
  }
}
