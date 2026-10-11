import { Request, Response } from "express";
import { format, startOfMonth, subMonths } from "date-fns";
import User from "../models/User";
import NamingDedicationForm from "../models/NamingDedicationForm";
import CourtshipForm from "../models/CourtshipForm";
import BurialForm from "../models/BurialForm";

const isAdministrator = (req: Request) =>
  ["admin", "superAdmin"].includes(req.user?.role || "");

const courtshipScope = (req: Request) => {
  if (isAdministrator(req)) return {};
  const email = req.user?.email.toLowerCase();
  return {
    $or: [
      { zonalCoordinatorEmail: email },
      { regionalPastorEmail: email },
    ],
  };
};

const emptyStatistics = () => ({ total: 0, pending: 0, approved: 0, completed: 0 });

async function getFormStatistics(
  FormModel: any,
  filter: Record<string, unknown> = {},
) {
  const [total, pending, approved, completed] = await Promise.all([
    FormModel.countDocuments(filter),
    FormModel.countDocuments({ ...filter, status: "pending" }),
    FormModel.countDocuments({ ...filter, status: "approved" }),
    FormModel.countDocuments({ ...filter, status: "completed" }),
  ]);
  return { total, pending, approved, completed };
}

// Administrators see all forms. Signatories see only courtship forms assigned
// to their email address, keeping dashboard data consistent with their role.
export const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    const admin = isAdministrator(req);
    const [users, namingDedication, courtship, burialRequest] = await Promise.all([
      admin
        ? Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "superAdmin" }),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "pastorate" }),
          ])
        : Promise.resolve([0, 0, 0, 0]),
      admin ? getFormStatistics(NamingDedicationForm) : Promise.resolve(emptyStatistics()),
      getFormStatistics(CourtshipForm, courtshipScope(req)),
      admin ? getFormStatistics(BurialForm) : Promise.resolve(emptyStatistics()),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        users: { total: users[0], superAdmin: users[1], admin: users[2], pastorate: users[3] },
        forms: { namingDedication, courtship, burialRequest },
        totals: {
          submissions: namingDedication.total + courtship.total + burialRequest.total,
          pending: namingDedication.pending + courtship.pending + burialRequest.pending,
          completed: namingDedication.completed + courtship.completed + burialRequest.completed,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const getChartData = async (req: Request, res: Response) => {
  try {
    const admin = isAdministrator(req);
    const scope = courtshipScope(req);
    const chartData = await Promise.all(
      Array.from({ length: 7 }, async (_, index) => {
        const monthStart = startOfMonth(subMonths(new Date(), 6 - index));
        const nextMonthStart = startOfMonth(subMonths(new Date(), 5 - index));
        const range = { createdAt: { $gte: monthStart, $lt: nextMonthStart } };
        const [naming, courtship, burial, namingCompleted, courtshipCompleted, burialCompleted] = await Promise.all([
          admin ? NamingDedicationForm.countDocuments(range) : Promise.resolve(0),
          CourtshipForm.countDocuments({ ...scope, ...range }),
          admin ? BurialForm.countDocuments(range) : Promise.resolve(0),
          admin ? NamingDedicationForm.countDocuments({ ...range, status: "completed" }) : Promise.resolve(0),
          CourtshipForm.countDocuments({ ...scope, ...range, status: "completed" }),
          admin ? BurialForm.countDocuments({ ...range, status: "completed" }) : Promise.resolve(0),
        ]);
        return { month: format(monthStart, "MMM"), submissions: naming + courtship + burial, completed: namingCompleted + courtshipCompleted + burialCompleted };
      }),
    );
    res.status(200).json({ status: "success", data: chartData });
  } catch (error) {
    console.error("Chart data error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const admin = isAdministrator(req);
    const [naming, courtship, burial, users] = await Promise.all([
      admin ? NamingDedicationForm.find().sort({ createdAt: -1 }).limit(3).select("babies fatherName motherName createdAt status") : Promise.resolve([]),
      CourtshipForm.find(courtshipScope(req)).sort({ createdAt: -1 }).limit(6).select("brotherName sisterName createdAt status zonalVerificationStatus regionalApprovalStatus"),
      admin ? BurialForm.find().sort({ createdAt: -1 }).limit(3).select("fullNameOfDeceased createdAt status") : Promise.resolve([]),
      admin ? User.find().sort({ createdAt: -1 }).limit(2).select("firstName lastName createdAt role") : Promise.resolve([]),
    ]);
    const activities = [
      ...naming.map((form: any) => activity(form, form.status === "completed" ? "Naming & Dedication form completed" : "New Naming & Dedication form submitted", `Form by ${form.fatherName} and ${form.motherName}`)),
      ...courtship.map((form: any) => activity(form, courtshipAction(form), `${form.brotherName} & ${form.sisterName}`)),
      ...burial.map((form: any) => activity(form, form.status === "completed" ? "Burial request completed" : "New burial request submitted", form.fullNameOfDeceased)),
      ...users.map((user: any) => ({ type: "user" as const, action: "New user registered", details: `${user.firstName} ${user.lastName} joined as ${user.role}`, time: formatTimeAgo(user.createdAt), timestamp: user.createdAt })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(({ timestamp, ...item }) => item);
    res.status(200).json({ status: "success", data: activities });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
};

function courtshipAction(form: any) {
  if (form.regionalApprovalStatus === "approved") return "Courtship form approved by Regional Pastor";
  if (form.zonalVerificationStatus === "verified") return "Courtship form awaiting Regional Pastor approval";
  return "Courtship form awaiting Zonal Coordinator review";
}

function activity(form: any, action: string, details: string) {
  return { type: form.status === "completed" ? "completed" as const : "submission" as const, action, details, time: formatTimeAgo(form.createdAt), timestamp: form.createdAt };
}

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} day${days === 1 ? "" : "s"} ago` : format(date, "MMM d, yyyy");
}
