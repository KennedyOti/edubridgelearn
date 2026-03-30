"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserPlus,
  BarChart3,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  total_users: number;
  active_students: number;
  pending_tutors: number;
  pending_contributors: number;
  active_tutors: number;
  suspended_users: number;
  total_tutors: number;
  total_contributors: number;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  tutor_profile?: {
    bio: string | null;
    verification_status: string;
    experience_years: number | null;
    subjects: string[] | null;
    hourly_rate: string | null;
    rate_currency: string;
  };
  contributor_profile?: {
    bio: string | null;
    verification_status: string;
    expertise_areas: string[] | null;
  };
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  country: string | null;
  created_at: string;
}

type ActiveTab = "overview" | "approvals" | "users" | "create-admin";

// ─── Mini bar chart for overview ─────────────────────────────────────────────

function MiniBarChart({ data, color = "#4F46E5" }: { data: number[]; color?: string }) {
  const max = Math.max(...data) || 1;
  const barW = 18;
  const gap = 8;
  const chartH = 50;

  return (
    <svg
      viewBox={`0 0 ${data.length * (barW + gap) - gap} ${chartH}`}
      className="w-full h-full"
    >
      {data.map((val, i) => {
        const bh = (val / max) * chartH;
        const x = i * (barW + gap);
        return (
          <rect
            key={i}
            x={x}
            y={chartH - bh}
            width={barW}
            height={bh}
            rx="3"
            fill={i === data.length - 1 ? color : `${color}55`}
          />
        );
      })}
    </svg>
  );
}

// ─── Area sparkline ───────────────────────────────────────────────────────────

function AreaSparkline({ data, color = "#4F46E5" }: { data: number[]; color?: string }) {
  const W = 120;
  const H = 40;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace("#", "")})`} />
      <path d={line} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  sparkData,
  sparkColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: string;
  sparkData?: number[];
  sparkColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {sparkData && (
          <div className="w-20 h-8">
            <AreaSparkline data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-success" />
          <span className="text-xs text-success font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
}

// ─── Approval card ────────────────────────────────────────────────────────────

function ApprovalCard({
  user,
  isRejecting,
  rejectReason,
  actionLoading,
  onApprove,
  onStartReject,
  onCancelReject,
  onReasonChange,
  onConfirmReject,
  profileInfo,
}: {
  user: PendingUser;
  isRejecting: boolean;
  rejectReason: string;
  actionLoading: boolean;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onReasonChange: (v: string) => void;
  onConfirmReject: () => void;
  profileInfo: { label: string; value: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Applied {new Date(user.created_at).toLocaleDateString()}
          </div>
          {profileInfo.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-3">
              {profileInfo.map((info) => (
                <div key={info.label}>
                  <span className="text-xs text-muted-foreground">{info.label}: </span>
                  <span className="text-xs font-medium text-foreground">{info.value}</span>
                </div>
              ))}
            </div>
          )}
          {(user.tutor_profile?.bio || user.contributor_profile?.bio) && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {user.tutor_profile?.bio || user.contributor_profile?.bio}
            </p>
          )}
        </div>
        {!isRejecting && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onApprove}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onStartReject}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {isRejecting && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <textarea
            placeholder="Provide a reason for rejection (required)..."
            value={rejectReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-input px-4 py-3 text-sm focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={onConfirmReject}
              disabled={!rejectReason.trim() || actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error text-white hover:bg-error/90 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Confirm Rejection
            </button>
            <button
              onClick={onCancelReject}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-10 text-center">
      <Icon className="w-10 h-10 mx-auto mb-3 text-success opacity-60" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    student: "bg-primary/10 text-primary",
    tutor: "bg-secondary/10 text-secondary",
    contributor: "bg-accent/10 text-accent",
    moderator: "bg-info/10 text-info",
    admin: "bg-warning/10 text-warning",
    super_admin: "bg-error/10 text-error",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] ?? "bg-muted text-muted-foreground"}`}>
      {role.replace("_", " ")}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-success/10 text-success",
    pending_approval: "bg-warning/10 text-warning",
    suspended: "bg-error/10 text-error",
    deactivated: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Inner dashboard (uses useSearchParams) ───────────────────────────────────

function AdminDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const tabParam = (searchParams.get("tab") ?? "overview") as ActiveTab;
  const [activeTab, setActiveTab] = useState<ActiveTab>(tabParam);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Approvals
  const [pendingTutors, setPendingTutors] = useState<PendingUser[]>([]);
  const [pendingContributors, setPendingContributors] = useState<PendingUser[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Users
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Create admin
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Sync tab from URL
  useEffect(() => {
    const valid: ActiveTab[] = ["overview", "approvals", "users", "create-admin"];
    if (valid.includes(tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    api.get("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [user]);

  useEffect(() => {
    if (activeTab !== "approvals" || !user) return;
    setApprovalsLoading(true);
    api.get("/admin/approvals")
      .then((res) => {
        setPendingTutors(res.data.data.tutors ?? []);
        setPendingContributors(res.data.data.contributors ?? []);
      })
      .catch(() => {})
      .finally(() => setApprovalsLoading(false));
  }, [activeTab, user]);

  const fetchUsers = useCallback(() => {
    if (activeTab !== "users" || !user) return;
    setUsersLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(currentPage));
    params.set("per_page", "15");
    api.get(`/admin/users?${params.toString()}`)
      .then((res) => {
        setUserList(res.data.data ?? []);
        setLastPage(res.data.meta?.last_page ?? 1);
        setTotalUsers(res.data.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [activeTab, user, searchTerm, roleFilter, statusFilter, currentPage]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleApproveTutor = async (userId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/tutors/${userId}/approve`);
      setPendingTutors((p) => p.filter((t) => t.id !== userId));
      setStats((s) => s ? { ...s, pending_tutors: s.pending_tutors - 1, active_tutors: s.active_tutors + 1 } : s);
    } catch {} finally { setActionLoading(false); }
  };

  const handleRejectTutor = async (userId: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/tutors/${userId}/reject`, { reason: rejectReason });
      setPendingTutors((p) => p.filter((t) => t.id !== userId));
      setRejectingId(null); setRejectReason("");
      setStats((s) => s ? { ...s, pending_tutors: s.pending_tutors - 1 } : s);
    } catch {} finally { setActionLoading(false); }
  };

  const handleApproveContributor = async (userId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/contributors/${userId}/approve`);
      setPendingContributors((p) => p.filter((c) => c.id !== userId));
      setStats((s) => s ? { ...s, pending_contributors: s.pending_contributors - 1 } : s);
    } catch {} finally { setActionLoading(false); }
  };

  const handleRejectContributor = async (userId: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/contributors/${userId}/reject`, { reason: rejectReason });
      setPendingContributors((p) => p.filter((c) => c.id !== userId));
      setRejectingId(null); setRejectReason("");
      setStats((s) => s ? { ...s, pending_contributors: s.pending_contributors - 1 } : s);
    } catch {} finally { setActionLoading(false); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(""); setCreateSuccess(""); setCreateLoading(true);
    try {
      await api.post("/admin/create-admin", createForm);
      setCreateSuccess(`${createForm.role === "admin" ? "Admin" : "Moderator"} account created for ${createForm.email}`);
      setCreateForm({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[] | Record<string, string[]> } } };
      const errors = e.response?.data?.errors;
      if (Array.isArray(errors)) setCreateError(errors[0]?.message || "Failed to create account.");
      else if (errors && typeof errors === "object") setCreateError(Object.values(errors)[0]?.[0] || "Failed to create account.");
      else setCreateError("Failed to create account.");
    } finally { setCreateLoading(false); }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await api.post(`/admin/users/${userId}/status`, { status });
      setUserList((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u));
    } catch {}
  };

  if (!user) return null;

  const pendingCount = stats ? stats.pending_tutors + stats.pending_contributors : 0;

  // Placeholder sparkline data
  const sparkUsers = [820, 850, 890, 920, 950, 980, 1020, 1060, 1100, 1150, 1200, stats?.total_users ?? 1240];
  const sparkStudents = [400, 420, 450, 480, 500, 510, 520, 540, 560, 580, 600, stats?.active_students ?? 620];

  return (
    <AdminDashboardLayout
      title={
        activeTab === "overview" ? "Dashboard Overview"
          : activeTab === "approvals" ? "Pending Approvals"
          : activeTab === "users" ? "User Management"
          : "Create Admin Account"
      }
      activeTab={activeTab}
    >
      <div className="p-4 sm:p-6 space-y-6">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Welcome back, {user.name.split(" ")[0]}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Platform-wide metrics and activity
              </p>
            </div>

            {/* Pending alert */}
            {!statsLoading && stats && pendingCount > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Pending Approvals Require Attention</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stats.pending_tutors > 0 && `${stats.pending_tutors} tutor application${stats.pending_tutors !== 1 ? "s" : ""}`}
                    {stats.pending_tutors > 0 && stats.pending_contributors > 0 && " and "}
                    {stats.pending_contributors > 0 && `${stats.pending_contributors} contributor application${stats.pending_contributors !== 1 ? "s" : ""}`}
                    {" "}awaiting review.
                  </p>
                </div>
                <Button size="sm" onClick={() => router.push("/admin/dashboard?tab=approvals")}>
                  Review Now
                </Button>
              </div>
            )}

            {/* Stats grid */}
            {statsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse h-28" />
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Primary stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.total_users} icon={Users} iconBg="bg-primary/10" iconColor="text-primary" trend="+12 this week" sparkData={sparkUsers} sparkColor="#4F46E5" />
                  <StatCard label="Active Students" value={stats.active_students} icon={GraduationCap} iconBg="bg-success/10" iconColor="text-success" trend="+8 this week" sparkData={sparkStudents} sparkColor="#22c55e" />
                  <StatCard label="Active Tutors" value={stats.active_tutors} icon={BookOpen} iconBg="bg-secondary/10" iconColor="text-secondary" />
                  <StatCard label="Contributors" value={stats.total_contributors} icon={Activity} iconBg="bg-accent/10" iconColor="text-accent" />
                </div>

                {/* Secondary stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-warning/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warning">{stats.pending_tutors}</div>
                      <div className="text-sm text-muted-foreground">Pending Tutors</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-info/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-info">{stats.pending_contributors}</div>
                      <div className="text-sm text-muted-foreground">Pending Contributors</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-border flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stats.total_tutors}</div>
                      <div className="text-sm text-muted-foreground">Total Tutors</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-error/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-error" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-error">{stats.suspended_users}</div>
                      <div className="text-sm text-muted-foreground">Suspended Users</div>
                    </div>
                  </div>
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">User Registrations (Weekly)</h3>
                      <span className="text-xs text-muted-foreground">Last 7 days</span>
                    </div>
                    <div className="h-16">
                      <MiniBarChart data={[42, 58, 35, 74, 66, 50, 68]} color="#4F46E5" />
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="text-[9px] text-muted-foreground">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Platform Growth</h3>
                      <div className="flex items-center gap-1 text-xs text-success font-medium">
                        <TrendingUp className="w-3 h-3" />
                        +18% this month
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Students", pct: Math.round((stats.active_students / (stats.total_users || 1)) * 100), color: "bg-primary" },
                        { label: "Tutors", pct: Math.round((stats.active_tutors / (stats.total_users || 1)) * 100), color: "bg-secondary" },
                        { label: "Contributors", pct: Math.round((stats.total_contributors / (stats.total_users || 1)) * 100), color: "bg-accent" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-semibold text-foreground">{item.pct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full transition-all duration-700`}
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Pending approvals</span>
                        <span className="font-bold text-warning">{pendingCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Suspended accounts</span>
                        <span className="font-bold text-error">{stats.suspended_users}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => router.push("/admin/dashboard?tab=approvals")}
                      className="group bg-white rounded-2xl p-4 border border-border hover:border-warning/30 hover:shadow-sm transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Review Approvals</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pendingCount} pending</p>
                    </button>
                    <button
                      onClick={() => router.push("/admin/dashboard?tab=users")}
                      className="group bg-white rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Manage Users</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stats.total_users} total</p>
                    </button>
                    {user.role === "super_admin" && (
                      <button
                        onClick={() => router.push("/admin/dashboard?tab=create-admin")}
                        className="group bg-white rounded-2xl p-4 border border-border hover:border-secondary/30 hover:shadow-sm transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <UserPlus className="w-4 h-4 text-secondary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Create Admin</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Add admin / moderator</p>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ── Approvals ── */}
        {activeTab === "approvals" && (
          <div className="space-y-8">
            {approvalsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-border animate-pulse h-32" />
                ))}
              </div>
            ) : (
              <>
                <section>
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    Pending Tutors
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {pendingTutors.length}
                    </span>
                  </h2>
                  {pendingTutors.length === 0 ? (
                    <EmptyState message="No pending tutor applications" icon={CheckCircle} />
                  ) : (
                    <div className="space-y-4">
                      {pendingTutors.map((tutor) => (
                        <ApprovalCard
                          key={tutor.id}
                          user={tutor}
                          isRejecting={rejectingId === tutor.id}
                          rejectReason={rejectReason}
                          actionLoading={actionLoading}
                          onApprove={() => handleApproveTutor(tutor.id)}
                          onStartReject={() => { setRejectingId(tutor.id); setRejectReason(""); }}
                          onCancelReject={() => setRejectingId(null)}
                          onReasonChange={setRejectReason}
                          onConfirmReject={() => handleRejectTutor(tutor.id)}
                          profileInfo={tutor.tutor_profile ? [
                            { label: "Experience", value: tutor.tutor_profile.experience_years ? `${tutor.tutor_profile.experience_years} yrs` : "Not specified" },
                            { label: "Rate", value: tutor.tutor_profile.hourly_rate ? `${tutor.tutor_profile.rate_currency} ${tutor.tutor_profile.hourly_rate}/hr` : "Not set" },
                            { label: "Subjects", value: tutor.tutor_profile.subjects?.join(", ") || "None listed" },
                          ] : []}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Pending Contributors
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {pendingContributors.length}
                    </span>
                  </h2>
                  {pendingContributors.length === 0 ? (
                    <EmptyState message="No pending contributor applications" icon={CheckCircle} />
                  ) : (
                    <div className="space-y-4">
                      {pendingContributors.map((c) => (
                        <ApprovalCard
                          key={c.id}
                          user={c}
                          isRejecting={rejectingId === c.id}
                          rejectReason={rejectReason}
                          actionLoading={actionLoading}
                          onApprove={() => handleApproveContributor(c.id)}
                          onStartReject={() => { setRejectingId(c.id); setRejectReason(""); }}
                          onCancelReject={() => setRejectingId(null)}
                          onReasonChange={setRejectReason}
                          onConfirmReject={() => handleRejectContributor(c.id)}
                          profileInfo={c.contributor_profile ? [
                            { label: "Expertise", value: c.contributor_profile.expertise_areas?.join(", ") || "None listed" },
                          ] : []}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {totalUsers > 0 ? `${totalUsers} total users` : "Search and manage platform users"}
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-white text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-input bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="contributor">Contributor</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-input bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {usersLoading ? (
                <div className="divide-y divide-border">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userList.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {userList.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <RoleBadge role={u.role} />
                        <StatusBadge status={u.status} />
                      </div>
                      <div className="text-xs text-muted-foreground hidden lg:block whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </div>
                      {u.role !== "super_admin" && !(u.role === "admin" && user.role !== "super_admin") && (
                        <select
                          value={u.status}
                          onChange={(e) => handleUpdateStatus(u.id, e.target.value)}
                          className="text-xs rounded-lg border border-input px-2 py-1 bg-white focus:outline-none focus:border-primary"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="deactivated">Deactivated</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {lastPage > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Page {currentPage} of {lastPage}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                      disabled={currentPage === lastPage}
                      className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Create Admin ── */}
        {activeTab === "create-admin" && user.role === "super_admin" && (
          <div className="max-w-lg space-y-4">
            <p className="text-sm text-muted-foreground">
              Add a new admin or moderator to the platform
            </p>

            <div className="bg-white rounded-2xl border border-border p-6">
              {createError && (
                <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
                  {createSuccess}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <Input
                  id="admin-name"
                  label="Full Name"
                  placeholder="John Admin"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
                <Input
                  id="admin-email"
                  type="email"
                  label="Email Address"
                  placeholder="admin@edubridge.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
                <Input
                  id="admin-password"
                  type="password"
                  label="Password"
                  placeholder="Min. 8 chars, uppercase, lowercase, number"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" isLoading={createLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminDashboardLayout>
  );
}

// ─── Page export (Suspense wrapper for useSearchParams) ───────────────────────

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <AdminDashboardInner />
    </Suspense>
  );
}
