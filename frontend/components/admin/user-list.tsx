"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Church,
  Search,
  UserCheck,
  Mail,
  RefreshCw,
  Plus,
} from "lucide-react";
import { getApiUrl } from "@/lib/api-url";

interface UserItem {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  role: "superAdmin" | "admin" | "pastorate" | string;
  zone?: string;
}

const fallbackUsers: UserItem[] = [
  {
    id: "usr-superadmin",
    firstName: "Super",
    lastName: "Admin",
    name: "Super Admin",
    email: "superadmin@daystarng.org",
    role: "superAdmin",
    zone: "Headquarters (Oregun)",
  },
  {
    id: "usr-admin",
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    email: "admin@daystarng.org",
    role: "admin",
    zone: "Operations Hub",
  },
  {
    id: "usr-pastor",
    firstName: "Pastor",
    lastName: "User",
    name: "Pastor User",
    email: "pastor@daystarng.org",
    role: "pastorate",
    zone: "Lekki Pastoral Region",
  },
  {
    id: "usr-pastor-nike",
    firstName: "Nike",
    lastName: "Adeyemi",
    name: "Pastor Nike Adeyemi",
    email: "pastor.nike@daystarng.org",
    role: "pastorate",
    zone: "Oregun Pastoral Region",
  },
  {
    id: "usr-pastor-sam",
    firstName: "Sam",
    lastName: "Adeyemi",
    name: "Pastor Sam Adeyemi",
    email: "pastor.sam@daystarng.org",
    role: "superAdmin",
    zone: "Senior Pastorate",
  },
];

export function UserList() {
  const [users, setUsers] = useState<UserItem[]>(fallbackUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${getApiUrl()}/api/users`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.users && data.data.users.length > 0) {
            setUsers(data.data.users);
          }
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""} ${u.name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) || u.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superAdmin":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case "pastorate":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-800 border border-blue-200">
            <Church className="w-3 h-3 text-blue-600" />
            Pastorate
          </span>
        );
      case "admin":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Portal Admin
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Staff & Ministers
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">
            {users.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Authorized portal accounts</p>
        </div>

        <div className="bg-[#dbeafe]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Pastoral Signatories
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">
            {users.filter((u) => u.role === "pastorate").length}
          </p>
          <p className="text-xs text-slate-600 mt-1">Assigned across 6 church zones</p>
        </div>

        <div className="bg-[#fef08a]/80 backdrop-blur-md rounded-[28px] p-5 border border-white/90 shadow-xs">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            System Administrators
          </p>
          <p className="text-3xl font-extrabold text-[#091122] mt-1">
            {users.filter((u) => u.role === "admin" || u.role === "superAdmin").length}
          </p>
          <p className="text-xs text-slate-700 mt-1">Full operational permissions</p>
        </div>
      </div>

      {/* Main Liquid Glass Table Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-white/90 shadow-xs">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Roles" },
              { id: "pastorate", label: "Pastorate" },
              { id: "admin", label: "Admins" },
              { id: "superAdmin", label: "Super Admins" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  roleFilter === tab.id
                    ? "bg-white text-[#091122] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white rounded-xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Name & Minister</th>
                <th className="pb-3 px-3">Email Address</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Assigned Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#091122] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {u.firstName?.[0] || u.name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-[#091122] text-xs">
                          {u.name || `${u.firstName} ${u.lastName}`.trim()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {u.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>

                  <td className="py-4 px-3">{getRoleBadge(u.role)}</td>

                  <td className="py-4 px-3 text-xs text-slate-500 font-medium">
                    {u.zone || "Daystar Central Operations"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserList;
