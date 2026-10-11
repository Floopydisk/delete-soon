import { NextResponse } from "next/server";

export async function GET() {
  const activities = [
    {
      type: "submission",
      action: "New Naming Form",
      details: "Chimamanda Joy Okeke registered in Oregun Zone",
      time: "2 hours ago",
    },
    {
      type: "completed",
      action: "Courtship Approved",
      details: "Femi Ojo & Kemi Alabi completed 15 counseling sessions",
      time: "1 day ago",
    },
    {
      type: "submission",
      action: "Burial Request",
      details: "Elder Samuel Babatunde request processed",
      time: "2 days ago",
    },
    {
      type: "user",
      action: "New Pastor Assigned",
      details: "Pastor David Balogun assigned to Ikeja Zone",
      time: "3 days ago",
    },
    {
      type: "submission",
      action: "Courtship Registered",
      details: "Michael Adeleke & Toyin Ogunleye started mentoring",
      time: "5 days ago",
    },
  ];

  return NextResponse.json({
    status: "success",
    data: activities,
  });
}
