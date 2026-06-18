"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  AlertCircle,
  PenTool,
  BarChart3,
  Flag,
  DollarSign,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, change, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && <TrendingUp className="w-3 h-3 text-success" />}
            {trend === "down" && <TrendingDown className="w-3 h-3 text-error" />}
            <span
              className={`text-xs font-medium ${
                trend === "up"
                  ? "text-success"
                  : trend === "down"
                  ? "text-error"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  labels,
  activeColor = "#4F46E5",
}: {
  data: number[];
  labels: string[];
  activeColor?: string;
}) {
  const max = Math.max(...data) || 1;
  const barW = 28;
  const gap = 12;
  const chartH = 80;
  const padLeft = 8;

  return (
    <svg viewBox={`0 0 ${data.length * (barW + gap) + padLeft} ${chartH + 22}`} className="w-full h-full">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={0}
          y1={chartH - pct * chartH}
          x2={data.length * (barW + gap) + padLeft}
          y2={chartH - pct * chartH}
          stroke="#e5e7eb"
          strokeWidth="0.5"
          strokeDasharray="4 2"
        />
      ))}

      {/* Bars */}
      {data.map((val, i) => {
        const bh = (val / max) * chartH;
        const x = padLeft + i * (barW + gap);
        const y = chartH - bh;
        const isMax = val === max;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={bh}
            rx="5"
            fill={isMax ? activeColor : `${activeColor}55`}
          />
        );
      })}

      {/* Labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={padLeft + i * (barW + gap) + barW / 2}
          y={chartH + 14}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

// ─── Area chart ───────────────────────────────────────────────────────────────

function AreaChart({
  data,
  labels,
  color = "#4F46E5",
}: {
  data: number[];
  labels: string[];
  color?: string;
}) {
  const W = 340;
  const H = 80;
  const padX = 4;
  const padY = 8;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - ((v - min) / range) * innerH,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padX}
          y1={padY + innerH * (1 - pct)}
          x2={W - padX}
          y2={padY + innerH * (1 - pct)}
          stroke="#e5e7eb"
          strokeWidth="0.5"
          strokeDasharray="4 2"
        />
      ))}
      {/* Area fill */}
      <path d={areaPath} fill={`url(#areaGrad-${color.replace("#", "")})`} />
      {/* Line */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={padX + (i / (labels.length - 1)) * innerW}
          y={H + 13}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}

// ─── Role-based config ────────────────────────────────────────────────────────

type Role = "student" | "tutor" | "contributor" | "moderator";

const statsConfig: Record<Role, StatCardProps[]> = {
  student: [
    { label: "Sessions Completed", value: "0", icon: Clock, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Resources Accessed", value: "0", icon: FileText, iconBg: "bg-secondary/10", iconColor: "text-secondary" },
    { label: "Learning Hours", value: "0h", icon: Activity, iconBg: "bg-accent/10", iconColor: "text-accent" },
    { label: "Achievements", value: "0", icon: Trophy, iconBg: "bg-warning/10", iconColor: "text-warning" },
  ],
  tutor: [
    { label: "Total Sessions", value: "0", icon: Clock, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Active Students", value: "0", icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
    { label: "This Month", value: "$0", icon: DollarSign, iconBg: "bg-success/10", iconColor: "text-success" },
    { label: "Avg Rating", value: "0.0", icon: Star, iconBg: "bg-warning/10", iconColor: "text-warning" },
  ],
  contributor: [
    { label: "Resources Published", value: "23", icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary", change: "+2 this month", trend: "up" },
    { label: "Total Downloads", value: "1,240", icon: Download, iconBg: "bg-secondary/10", iconColor: "text-secondary", change: "+18%", trend: "up" },
    { label: "This Month", value: "$320", icon: DollarSign, iconBg: "bg-success/10", iconColor: "text-success", change: "+8%", trend: "up" },
    { label: "Pending Review", value: "2", icon: Clock, iconBg: "bg-warning/10", iconColor: "text-warning", change: "Awaiting approval", trend: "neutral" },
  ],
  moderator: [
    { label: "Flagged Items", value: "8", icon: Flag, iconBg: "bg-error/10", iconColor: "text-error", change: "-2 today", trend: "up" },
    { label: "Reviews Done", value: "45", icon: Shield, iconBg: "bg-primary/10", iconColor: "text-primary", change: "+12 this week", trend: "up" },
    { label: "Active Users", value: "1,240", icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent", change: "+3%", trend: "up" },
    { label: "Reports Pending", value: "3", icon: AlertCircle, iconBg: "bg-warning/10", iconColor: "text-warning", change: "Needs attention", trend: "neutral" },
  ],
};

const chartConfig: Record<Role, { bar: number[]; area: number[] }> = {
  student: {
    bar: [],
    area: [],
  },
  tutor: {
    bar: [],
    area: [],
  },
  contributor: {
    bar: [80, 120, 100, 160, 140, 90, 110],
    area: [180, 220, 200, 280, 310, 260, 340, 380, 310, 420, 390, 440],
  },
  moderator: {
    bar: [12, 8, 15, 6, 10, 5, 8],
    area: [45, 52, 48, 60, 55, 70, 65, 80, 72, 85, 78, 90],
  },
};

const quickActionsConfig: Record<Role, React.ComponentProps<typeof QuickAction>[]> = {
  student: [
    { icon: BookOpen, title: "Find a Tutor", description: "Browse and book sessions with expert tutors", iconBg: "bg-primary/10", iconColor: "text-primary", href: "/tutors" },
    { icon: Brain, title: "AI Teacher", description: "Get instant help from your AI study assistant", iconBg: "bg-secondary/10", iconColor: "text-secondary", href: "/ai-teacher" },
    { icon: FileText, title: "Resources", description: "Browse study materials and past papers", iconBg: "bg-warning/10", iconColor: "text-warning", href: "/resources" },
    { icon: Trophy, title: "Progress", description: "Track your learning achievements", iconBg: "bg-success/10", iconColor: "text-success", href: "/progress" },
    { icon: Users, title: "Community", description: "Join discussions and ask questions", iconBg: "bg-accent/10", iconColor: "text-accent", href: "/community" },
    { icon: Clock, title: "My Sessions", description: "View upcoming and past sessions", iconBg: "bg-info/10", iconColor: "text-info", href: "/sessions" },
  ],
  tutor: [
    { icon: Clock, title: "My Sessions", description: "View and manage your tutoring sessions", iconBg: "bg-primary/10", iconColor: "text-primary", href: "/sessions" },
    { icon: BookOpen, title: "My Courses", description: "Create and manage your recorded lessons", iconBg: "bg-secondary/10", iconColor: "text-secondary", href: "/courses" },
    { icon: Users, title: "My Students", description: "View your full student roster", iconBg: "bg-accent/10", iconColor: "text-accent", href: "/students" },
    { icon: DollarSign, title: "Earnings", description: "View earnings and withdraw funds", iconBg: "bg-success/10", iconColor: "text-success", href: "/earnings" },
    { icon: BarChart3, title: "Analytics", description: "Track your performance and ratings", iconBg: "bg-info/10", iconColor: "text-info", href: "/analytics" },
    { icon: FileText, title: "Resources", description: "Upload and manage study materials", iconBg: "bg-warning/10", iconColor: "text-warning", href: "/resources" },
  ],
  contributor: [
    { icon: FileText, title: "My Resources", description: "Manage your uploaded materials", iconBg: "bg-primary/10", iconColor: "text-primary", href: "/resources" },
    { icon: DollarSign, title: "Earnings", description: "View your earnings and withdraw", iconBg: "bg-success/10", iconColor: "text-success", href: "/earnings" },
    { icon: BarChart3, title: "Analytics", description: "Track views and downloads", iconBg: "bg-info/10", iconColor: "text-info", href: "/analytics" },
    { icon: PenTool, title: "Blog", description: "Write and publish educational posts", iconBg: "bg-secondary/10", iconColor: "text-secondary", href: "/blog" },
  ],
  moderator: [
    { icon: Flag, title: "Flagged Content", description: "Review reported content and users", iconBg: "bg-error/10", iconColor: "text-error", href: "/flagged" },
    { icon: FileText, title: "Content Review", description: "Approve or reject submitted resources", iconBg: "bg-warning/10", iconColor: "text-warning", href: "/content-review" },
    { icon: Users, title: "Community", description: "Manage community discussions", iconBg: "bg-primary/10", iconColor: "text-primary", href: "/community" },
    { icon: Shield, title: "User Reports", description: "Handle user complaints and warnings", iconBg: "bg-secondary/10", iconColor: "text-secondary", href: "/reports" },
  ],
};

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartTitles: Record<Role, { bar: string; area: string }> = {
  student: { bar: "Sessions This Week", area: "Learning Hours (Monthly)" },
  tutor: { bar: "Sessions This Week", area: "Earnings Trend (Monthly, $)" },
  contributor: { bar: "Downloads This Week", area: "Resource Views (Monthly)" },
  moderator: { bar: "Reviews This Week", area: "Activity Trend (Monthly)" },
};

interface ActivityItem {
  label: string;
  time: string;
  color: string;
}

const recentActivityConfig: Record<Role, ActivityItem[]> = {
  student: [],
  tutor: [],
  contributor: [],
  moderator: [],
};

const welcomeText: Record<string, string> = {
  student: "Continue your learning journey",
  tutor: "Manage your tutoring sessions",
  contributor: "Manage your content contributions",
  moderator: "Review content and manage the community",
};

// ─── Tutor dashboard data (real-time from backend) ─────────────────────────────

interface TutorDashboard {
  stats: {
    total_sessions: number;
    sessions_this_month: number;
    active_students: number;
    new_students_this_month: number;
    earnings_this_month: number;
    earnings_change_pct: number | null;
    currency: string;
    avg_rating: number;
    verification_status: string;
  };
  charts: {
    weekly_sessions: number[];
    monthly_earnings: number[];
  };
  recent_activity: ActivityItem[];
}

function currencySymbol(code: string): string {
  const map: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", KES: "KSh", NGN: "₦" };
  return map[code] ?? `${code} `;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const [tutorData, setTutorData] = useState<TutorDashboard | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "tutor") {
      api
        .get("/tutors/dashboard")
        .then((res) => setTutorData(res.data.data))
        .catch(() => setTutorData(null));
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role === "admin" || user?.role === "super_admin") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Refresh the user from the backend so status changes (e.g. admin approval)
  // are reflected without requiring a re-login.
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!user) return null;
  if (user.role === "admin" || user.role === "super_admin") return null;

  const role = (user.role ?? "student") as Role;
  let stats = statsConfig[role] ?? statsConfig.student;
  let charts = chartConfig[role] ?? chartConfig.student;
  const actions = quickActionsConfig[role] ?? quickActionsConfig.student;
  const titles = chartTitles[role] ?? chartTitles.student;
  let recentActivity = recentActivityConfig[role] ?? [];
  const isPending = user.status === "pending_approval";

  // Replace the tutor placeholders with real-time data from the backend.
  if (role === "tutor" && tutorData) {
    const s = tutorData.stats;
    const sym = currencySymbol(s.currency);
    stats = [
      {
        label: "Total Sessions",
        value: String(s.total_sessions),
        icon: Clock,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        ...(s.sessions_this_month > 0
          ? { change: `+${s.sessions_this_month} this month`, trend: "up" as const }
          : {}),
      },
      {
        label: "Active Students",
        value: String(s.active_students),
        icon: Users,
        iconBg: "bg-accent/10",
        iconColor: "text-accent",
        ...(s.new_students_this_month > 0
          ? { change: `+${s.new_students_this_month} this month`, trend: "up" as const }
          : {}),
      },
      {
        label: "This Month",
        value: `${sym}${s.earnings_this_month.toLocaleString()}`,
        icon: DollarSign,
        iconBg: "bg-success/10",
        iconColor: "text-success",
        ...(s.earnings_change_pct !== null
          ? {
              change: `${s.earnings_change_pct >= 0 ? "+" : ""}${s.earnings_change_pct}% vs last month`,
              trend: (s.earnings_change_pct >= 0 ? "up" : "down") as "up" | "down",
            }
          : {}),
      },
      {
        label: "Avg Rating",
        value: s.avg_rating ? s.avg_rating.toFixed(1) : "—",
        icon: Star,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
    ];
    charts = {
      bar: tutorData.charts.weekly_sessions,
      area: tutorData.charts.monthly_earnings,
    };
    recentActivity = tutorData.recent_activity;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">

        {/* Banners */}
        {isPending && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Account Pending Approval</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your {user.role} account is under review. You&apos;ll be notified once approved.
              </p>
            </div>
          </div>
        )}

        {user.role === "student" && !user.student_profile?.onboarding_completed && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">Set up learning preferences for a personalised experience</p>
              </div>
            </div>
            <Link href="/onboarding">
              <Button size="sm">
                Complete Setup <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {user.role === "contributor" && !user.contributor_profile?.bio && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Complete Your Contributor Profile</p>
                <p className="text-sm text-muted-foreground">Set up your profile and submit for review to start publishing</p>
              </div>
            </div>
            <Link href="/contributor/setup">
              <Button size="sm">
                Complete Setup <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {user.role === "tutor" && !user.tutor_profile?.bio && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/5 border border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Complete Your Tutor Profile</p>
                <p className="text-sm text-muted-foreground">Set up your profile and submit for admin approval</p>
              </div>
            </div>
            <Link href="/tutor/setup">
              <Button size="sm">
                Complete Setup <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {welcomeText[user.role] ?? "Welcome to EduBridge Learn"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block text-right">
            {dateStr}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{titles.bar}</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-36">
              {charts.bar.length > 0 ? (
                <BarChart data={charts.bar} labels={weekLabels} activeColor="#4F46E5" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{titles.area}</h2>
              <span className="text-xs text-muted-foreground">This year</span>
            </div>
            <div className="h-36">
              {charts.area.length > 0 ? (
                <AreaChart data={charts.area} labels={monthLabels} color="#7C3AED" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            {recentActivity.length > 0 && (
              <button className="text-xs text-primary font-medium hover:text-primary-dark">
                View all
              </button>
            )}
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent activity yet
            </p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
